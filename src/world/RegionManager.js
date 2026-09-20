// ===================================================================
// VIGHNAHARTA — MULTI-REGION & TASK PROGRESSION SYSTEM
// Modular region definitions with unique environmental themes,
// distinct interactive objectives, live progress tracking,
// and clear completion & unlock feedback.
// ===================================================================

export class RegionManager {
  constructor(game) {
    this.game = game;
    this.currentRegionIndex = 0;

    // Define All Game Regions & Distinct Tasks
    this.regions = [
      {
        id: 'REGION_1',
        name: 'FESTIVAL ENTRANCE',
        subname: 'SACRED GHATS & MARIGOLD CANALS',
        startDist: 0,
        endDist: 350,
        taskName: 'COLLECT SACRED MODAKS',
        taskDesc: 'Gather 10 Modak offerings for the ceremony',
        target: 10,
        progress: 0,
        isCompleted: false,
        collectibleType: 'MODAK',
        fogColor: 0x5a2810,
        lightColor: 0xffeed4
      },
      {
        id: 'REGION_2',
        name: 'DEODAR FOOTHILLS',
        subname: 'MISTY PINE HILLS & MOUNTAIN RAPIDS',
        startDist: 350,
        endDist: 750,
        taskName: 'LIGHT SACRED DIYAS',
        taskDesc: 'Ignite 5 brass Diya lamps along the causeway',
        target: 5,
        progress: 0,
        isCompleted: false,
        collectibleType: 'DIYA',
        fogColor: 0x485868,
        lightColor: 0xfff0dc
      },
      {
        id: 'REGION_3',
        name: 'HIMALAYAN SNOW PASSAGE',
        subname: 'FROSTED PEAKS & SACRED BLIZZARD',
        startDist: 750,
        endDist: 1200,
        taskName: 'OVERCOME DIVINE TRIALS',
        taskDesc: 'Successfully clear 6 obstacle trials',
        target: 6,
        progress: 0,
        isCompleted: false,
        collectibleType: 'TRIAL',
        fogColor: 0x6e8898,
        lightColor: 0xfff8ee
      },
      {
        id: 'REGION_4',
        name: 'ROYAL TEMPLE APPROACH',
        subname: 'SACRED SANCTUM & BRIHADEESWARAR TEMPLE',
        startDist: 1200,
        endDist: 1500,
        taskName: 'FOLLOW MUSHAK TO GANESHA',
        taskDesc: 'Follow your divine companion to the Lotus Sanctum',
        target: 1,
        progress: 0,
        isCompleted: false,
        collectibleType: 'DESTINATION',
        fogColor: 0x5a2408,
        lightColor: 0xffe4b0
      }
    ];

    this.onTaskProgress = null;
    this.onTaskComplete = null;
    this.onRegionEnter = null;
  }

  getCurrentRegion() {
    return this.regions[this.currentRegionIndex] || this.regions[this.regions.length - 1];
  }

  update(distance) {
    const prevIndex = this.currentRegionIndex;

    // Detect Region Transition by Distance
    for (let i = 0; i < this.regions.length; i++) {
      if (distance >= this.regions[i].startDist && distance < this.regions[i].endDist) {
        this.currentRegionIndex = i;
        break;
      }
    }

    // Trigger Region Transition Event
    if (this.currentRegionIndex !== prevIndex) {
      const newRegion = this.regions[this.currentRegionIndex];
      if (this.onRegionEnter) {
        this.onRegionEnter(newRegion);
      }
    }
  }

  addProgress(type, amount = 1) {
    const current = this.getCurrentRegion();
    if (current.isCompleted) return;

    if (current.collectibleType === type || type === 'ANY') {
      current.progress = Math.min(current.target, current.progress + amount);

      if (this.onTaskProgress) {
        this.onTaskProgress(current);
      }

      // Check Task Completion
      if (current.progress >= current.target && !current.isCompleted) {
        current.isCompleted = true;
        if (this.onTaskComplete) {
          this.onTaskComplete(current);
        }
      }
    }
  }

  reset() {
    this.currentRegionIndex = 0;
    this.regions.forEach(r => {
      r.progress = 0;
      r.isCompleted = false;
    });
  }
}
