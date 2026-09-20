// ===================================================================
// VIGHNAHARTA — DATA-DRIVEN 10-TASK PROGRESSION & SCORING MANAGER
// Manages sequential adventure tasks, live timers, Vighna tracking (3/3),
// and scoring system without blocking runner momentum.
// ===================================================================

export class TaskManager {
  constructor(game) {
    this.game = game;

    // Progression & Metrics
    this.currentTaskIndex = 0; // 0 to 9 (Tasks 1 to 10)
    this.tasksCompleted = 0;
    this.vighnasCleared = 0; // Max 3
    this.totalStarsCollected = 0;
    this.score = 0;
    
    // Timer
    this.elapsedTime = 0; // in seconds
    this.isTimerRunning = false;

    // Active Task specific trackers
    this.taskStarsCollected = 0;

    // Define the 10 Sequential Adventure Tasks
    this.tasks = [
      {
        id: 'TASK_1_ENTRANCE',
        num: 1,
        title: 'TEMPLE ENTRANCE',
        shortDesc: 'Explore the ancient temple entrance',
        type: 'REACH_DISTANCE',
        targetDistance: 120,
        scoreReward: 500,
        icon: '🏛️'
      },
      {
        id: 'TASK_2_VIGHNA_1',
        num: 2,
        title: 'FIRST VIGHNA',
        shortDesc: 'Find and press [E] to clear Vighna 1',
        type: 'CLEAR_VIGHNA',
        vighnaId: 1,
        scoreReward: 1000,
        icon: '🔱'
      },
      {
        id: 'TASK_3_STARS_5',
        num: 3,
        title: 'STAR COLLECTION',
        shortDesc: 'Collect 5 divine stars along the path',
        type: 'COLLECT_STARS',
        targetCount: 5,
        scoreReward: 500,
        icon: '★'
      },
      {
        id: 'TASK_4_FESTIVAL_SHRINE',
        num: 4,
        title: 'FESTIVAL SHRINE',
        shortDesc: 'Find the sacred shrine and press [E]',
        type: 'INTERACT_OBJECT',
        interactId: 'SHRINE_1',
        scoreReward: 600,
        icon: '🪔'
      },
      {
        id: 'TASK_5_COURTYARD',
        num: 5,
        title: 'COURTYARD EXPLORATION',
        shortDesc: 'Reach the sacred Ghats & Courtyard',
        type: 'REACH_DISTANCE',
        targetDistance: 750,
        scoreReward: 500,
        icon: '🌺'
      },
      {
        id: 'TASK_6_VIGHNA_2',
        num: 6,
        title: 'SECOND VIGHNA',
        shortDesc: 'Locate and press [E] to clear Vighna 2',
        type: 'CLEAR_VIGHNA',
        vighnaId: 2,
        scoreReward: 1000,
        icon: '🔱'
      },
      {
        id: 'TASK_7_STARS_10',
        num: 7,
        title: 'LARGER STAR CHALLENGE',
        shortDesc: 'Collect 10 divine stars in the mountains',
        type: 'COLLECT_STARS',
        targetCount: 10,
        scoreReward: 700,
        icon: '★'
      },
      {
        id: 'TASK_8_TEMPLE_BELL',
        num: 8,
        title: 'TEMPLE INTERACTION',
        shortDesc: 'Press [E] to ring the sacred Temple Bell',
        type: 'INTERACT_OBJECT',
        interactId: 'BELL_1',
        scoreReward: 800,
        icon: '🔔'
      },
      {
        id: 'TASK_9_VIGHNA_3',
        num: 9,
        title: 'THIRD VIGHNA',
        shortDesc: 'Locate and clear the final Vighna 3',
        type: 'CLEAR_VIGHNA',
        vighnaId: 3,
        scoreReward: 1000,
        icon: '🔱'
      },
      {
        id: 'TASK_10_FINAL_JOURNEY',
        num: 10,
        title: 'FINAL JOURNEY',
        shortDesc: 'Follow Mushak to Bhagwan Ganesha',
        type: 'FINAL_DESTINATION',
        targetDistance: 1500,
        scoreReward: 2500,
        icon: '🕉️'
      }
    ];
  }

  reset() {
    this.currentTaskIndex = 0;
    this.tasksCompleted = 0;
    this.vighnasCleared = 0;
    this.totalStarsCollected = 0;
    this.score = 0;
    this.elapsedTime = 0;
    this.isTimerRunning = true;
    this.taskStarsCollected = 0;
  }

  start() {
    this.reset();
  }

  stopTimer() {
    this.isTimerRunning = false;
  }

  getCurrentTask() {
    if (this.currentTaskIndex >= this.tasks.length) {
      return null;
    }
    return this.tasks[this.currentTaskIndex];
  }

  getProgressDisplay() {
    const task = this.getCurrentTask();
    if (!task) {
      return { text: 'ALL TASKS COMPLETE', progressPercent: 100 };
    }

    if (task.type === 'COLLECT_STARS') {
      const current = Math.min(this.taskStarsCollected, task.targetCount);
      const percent = (current / task.targetCount) * 100;
      return {
        text: `${current}/${task.targetCount}`,
        current: current,
        target: task.targetCount,
        progressPercent: percent
      };
    } else if (task.type === 'REACH_DISTANCE') {
      const dist = Math.min(this.game.distance, task.targetDistance);
      const percent = (dist / task.targetDistance) * 100;
      return {
        text: `${Math.floor(dist)}m / ${task.targetDistance}m`,
        current: Math.floor(dist),
        target: task.targetDistance,
        progressPercent: percent
      };
    } else if (task.type === 'CLEAR_VIGHNA') {
      return {
        text: `Vighna ${task.vighnaId}/3`,
        progressPercent: 50
      };
    } else if (task.type === 'INTERACT_OBJECT') {
      return {
        text: 'Approach & Press [E]',
        progressPercent: 50
      };
    } else if (task.type === 'FINAL_DESTINATION') {
      const dist = Math.min(this.game.distance, task.targetDistance);
      const percent = Math.min(100, Math.max(0, ((dist - 1200) / 300) * 100));
      return {
        text: `${Math.floor(dist)}m / 1,500m`,
        progressPercent: percent
      };
    }

    return { text: '', progressPercent: 0 };
  }

  update(delta, distance) {
    if (this.isTimerRunning) {
      this.elapsedTime += delta;
    }

    const task = this.getCurrentTask();
    if (!task) return;

    // Check Distance-based tasks automatically
    if (task.type === 'REACH_DISTANCE') {
      if (distance >= task.targetDistance) {
        this.completeTask(task);
      }
    } else if (task.type === 'FINAL_DESTINATION') {
      if (distance >= task.targetDistance) {
        this.completeTask(task);
      }
    }
  }

  onStarCollected() {
    this.totalStarsCollected++;
    this.score += 100 * Math.max(1, this.game.combo || 1);

    const task = this.getCurrentTask();
    if (task && task.type === 'COLLECT_STARS') {
      this.taskStarsCollected++;
      if (this.taskStarsCollected >= task.targetCount) {
        this.completeTask(task);
      }
    }
  }

  onInteract(interactableId) {
    const task = this.getCurrentTask();
    if (!task) return false;

    if (task.type === 'INTERACT_OBJECT' && task.interactId === interactableId) {
      this.completeTask(task);
      return true;
    } else if (task.type === 'CLEAR_VIGHNA' && (task.interactId === interactableId || `VIGHNA_${task.vighnaId}` === interactableId)) {
      this.vighnasCleared = Math.min(3, this.vighnasCleared + 1);
      this.completeTask(task);
      return true;
    }

    return false;
  }

  completeTask(task) {
    if (!task) return;

    this.score += task.scoreReward || 500;
    this.tasksCompleted++;
    this.taskStarsCollected = 0; // Reset counter for future star tasks

    // UI feedback
    if (this.game.ui) {
      this.game.ui.triggerTaskComplete(task);
    }
    if (this.game.audio) {
      this.game.audio.playVictoryChime();
    }
    if (this.game.vfx) {
      this.game.vfx.createStarBurst(this.game.player.mesh.position);
    }

    // Advance to next task
    this.currentTaskIndex++;
  }

  getFormattedTime() {
    const totalSecs = Math.floor(this.elapsedTime);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getFinalResults() {
    return {
      score: this.score,
      timeFormatted: this.getFormattedTime(),
      stars: this.totalStarsCollected,
      vighnasCleared: Math.min(3, this.vighnasCleared),
      tasksCompleted: Math.min(10, this.tasksCompleted),
      totalTasks: 10
    };
  }
}
