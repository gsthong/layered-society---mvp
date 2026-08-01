import { globalPRNG } from "./PRNG";
import {
  Agent,
  HistoricalMetric,
  LogEntry,
  NetworkTopology,
  ResourceNode,
  SimulationConfig,
} from "../types";
import { calculateLLR, updateBeliefs } from "./BeliefEngine";
import { createNeuralNetwork, forwardNeuralNetwork, mutateNeuralNetwork } from "./NeuralNetwork";
import { calculateNetworkTopology } from "./SocialGraph";

export class WorldSimulation {
  agents: Agent[] = [];
  resources: ResourceNode[] = [];
  currentTick: number = 0;
  dayNightLight: number = 1.0; // 0.2 (night) to 1.0 (day)
  topology: NetworkTopology = {
    fiedlerValue: 0,
    clusteringCoeff: 0,
    avgPathLength: 0,
    edges: [],
    factionCounts: { 0: 0, 1: 0, 2: 0 },
  };
  metricsHistory: HistoricalMetric[] = [];
  logs: LogEntry[] = [];
  currentSocialCohesion: number = 1.0;
  adaptiveFModifier: number = 0.25;

  constructor(config: SimulationConfig) {
    this.reset(config);
  }

  public reset(config: SimulationConfig) {
    this.currentTick = 0;
    this.agents = [];
    this.resources = [];
    this.metricsHistory = [];
    this.logs = [];

    const numSleepers = Math.floor(config.agentCount * config.sleeperRatio);

    // Initialize Agents
    for (let i = 0; i < config.agentCount; i++) {
      const isSleeper = i < numSleepers;
      const angle = Math.random() * Math.PI * 2;
      const initX = Math.random() * (config.worldWidth - 100) + 50;
      const initY = Math.random() * (config.worldHeight - 100) + 50;
      const initEnergy = 60 + Math.random() * 40;
      
      const agent: Agent = {
        id: i + 1,
        x: initX,
        y: initY,
        vx: Math.cos(angle),
        vy: Math.sin(angle),
        angle,
        speed: 1.0,
        radius: 7,
        energy: initEnergy,
        maxEnergy: 200,
        status: "active",
        respawnTimer: 0,
        brain: createNeuralNetwork(),
        belief: isSleeper ? 0.9 : Math.random() * 0.2, // Sleepers start with high misinformation
        llr: 0,
        isSleeper,
        isSleeperActivated: false,
        isImmune: Math.random() < 0.2, // 20% natural SW-MSR immunity
        factionId: isSleeper ? 2 : 0,
        neighborsCount: 0,
        memoryStream: [
          `Agent #${i + 1} initialized in Layer 0 World Box.`,
          isSleeper ? "ROLE ASSIGNED: Sleeper Agent (Infiltration Unit)." : "Role: Standard Citizen.",
        ],
        biographyLogs: [
          {
            id: Math.random().toString(36).substring(2, 9),
            tick: 0,
            type: "birth",
            message: `Agent #${i + 1} born in sandbox sector at (${Math.round(initX)}, ${Math.round(initY)}). Initial Energy: ${Math.round(initEnergy)}.`,
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: Math.random().toString(36).substring(2, 9),
            tick: 0,
            type: "birth",
            message: isSleeper ? "Assigned role: Sleeper Infiltrator Node." : "Assigned role: Standard Citizen Node.",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        lastReflectionTick: 0,
        reflections: [],
        isReflecting: false,
        resourcesGathered: 0,
        lifetimeTicks: 0,
        distanceTraveled: 0,
        color: isSleeper ? "#ef4444" : "#3b82f6",
        trail: [],
      };
      agent.llr = calculateLLR(agent.belief);
      this.agents.push(agent);
    }

    // Initialize Resource Nodes
    for (let i = 0; i < config.resourceCount; i++) {
      this.resources.push({
        id: i + 1,
        x: Math.random() * (config.worldWidth - 80) + 40,
        y: Math.random() * (config.worldHeight - 80) + 40,
        radius: 12 + Math.random() * 6,
        energyValue: 80,
        maxEnergy: 80,
        currentEnergy: 80,
        active: true,
        respawnTimer: 0,
      });
    }

    this.addLog("system", `Simulation initialized with ${config.agentCount} agents (${numSleepers} sleepers) and ${config.resourceCount} resources.`);
  }

  public addLog(category: LogEntry["category"], message: string) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      tick: this.currentTick,
      timestamp: new Date().toLocaleTimeString(),
      category,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 80) {
      this.logs.pop();
    }
  }

  public toggleSleeperActivation() {
    let count = 0;
    this.agents.forEach((a) => {
      if (a.isSleeper) {
        a.isSleeperActivated = !a.isSleeperActivated;
        if (a.isSleeperActivated) {
          count++;
          if (!a.biographyLogs) a.biographyLogs = [];
          a.biographyLogs.unshift({
            id: Math.random().toString(36).substring(2, 9),
            tick: this.currentTick,
            type: "sleeper",
            message: `Activated Infiltration Protocol: Transmitting SPM misinformation to neighbors.`,
            timestamp: new Date().toLocaleTimeString(),
          });
        } else {
          if (!a.biographyLogs) a.biographyLogs = [];
          a.biographyLogs.unshift({
            id: Math.random().toString(36).substring(2, 9),
            tick: this.currentTick,
            type: "sleeper",
            message: `Deactivated Infiltration Protocol. Returned to quiet observation mode.`,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    });

    const isActivated = count > 0;
    this.addLog(
      "sleeper",
      isActivated
        ? `🚨 CRITICAL: ${count} Sleeper Agents ACTIVATED! Transmitting Strategic Misinformation.`
        : "🛡️ Sleeper Agents DEACTIVATED. Standing down."
    );
  }

  public triggerEnvironmentalDisaster() {
    // Deplete 80% of resources and add panic belief
    let depletedCount = 0;
    this.resources.forEach((r) => {
      if (Math.random() < 0.75) {
        r.currentEnergy = 0;
        r.active = false;
        r.respawnTimer = 250;
        depletedCount++;
      }
    });

    this.agents.forEach((a) => {
      if (a.status === "active") {
        a.belief = Math.min(1.0, a.belief + 0.4); // Panic spike
        a.memoryStream.unshift(`[Tick ${this.currentTick}]: Severe Resource Drought Event triggered!`);
        if (!a.biographyLogs) a.biographyLogs = [];
        a.biographyLogs.unshift({
          id: Math.random().toString(36).substring(2, 9),
          tick: this.currentTick,
          type: "disaster",
          message: `Survived Drought Disaster event. Resource supply collapsed; belief/panic spiked to ${(a.belief * 100).toFixed(0)}%.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });

    this.addLog("environment", `🌋 DISASTER TRIGGERED: Drought wiped out ${depletedCount} resource nodes! Agent panic spiked.`);
  }

  public tick(config: SimulationConfig) {
    this.currentTick++;

    // 1. Day/Night Cycle
    this.dayNightLight = 0.5 + 0.5 * Math.sin(this.currentTick * config.dayNightSpeed * 0.02);

    // 2. Resource Management & Respawn
    this.resources.forEach((res) => {
      if (!res.active) {
        res.respawnTimer--;
        if (res.respawnTimer <= 0) {
          res.active = true;
          res.currentEnergy = res.maxEnergy;
          res.x = Math.random() * (config.worldWidth - 80) + 40;
          res.y = Math.random() * (config.worldHeight - 80) + 40;
        }
      }
    });

    const activeResources = this.resources.filter((r) => r.active);

    // 3. Agent Physics, Sensory Perception & Neural Decision
    this.agents.forEach((agent) => {
      if (!agent.biographyLogs) agent.biographyLogs = [];

      if (agent.status === "respawning") {
        agent.respawnTimer--;
        if (agent.respawnTimer <= 0) {
          // Respawn agent with full energy at new location
          agent.status = "active";
          agent.energy = 200;
          agent.x = Math.random() * (config.worldWidth - 100) + 50;
          agent.y = Math.random() * (config.worldHeight - 100) + 50;
          agent.belief = agent.isSleeper ? 0.9 : 0.1;
          this.addLog("system", `Agent #${agent.id} respawned in Layer 0.`);
          
          agent.biographyLogs.unshift({
            id: Math.random().toString(36).substring(2, 9),
            tick: this.currentTick,
            type: "respawn",
            message: `Re-emerged into Layer 0 Sandbox at (${Math.round(agent.x)}, ${Math.round(agent.y)}) with 100 HP.`,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        return;
      }

      if (agent.status === "depleted") return;

      agent.lifetimeTicks++;

      // Periodic social interaction log (every 120 ticks)
      if (agent.lifetimeTicks % 120 === 0 && agent.neighborsCount > 0) {
        agent.biographyLogs.unshift({
          id: Math.random().toString(36).substring(2, 9),
          tick: this.currentTick,
          type: "influence",
          message: `In contact with ${agent.neighborsCount} neighboring nodes within vision radius (Belief: ${(agent.belief * 100).toFixed(0)}%).`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      // Find nearest active resource
      let minDistRes = Infinity;
      let angleToRes = 0;
      activeResources.forEach((res) => {
        const dx = res.x - agent.x;
        const dy = res.y - agent.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < minDistRes) {
          minDistRes = dSq;
          angleToRes = Math.atan2(dy, dx);
        }
      });
      minDistRes = Math.sqrt(minDistRes);

      // Find nearest neighboring agent
      let minDistAgentSq = Infinity;
      let neighborCount = 0;
      const visionRadiusSq = config.visionRadius * config.visionRadius;
      this.agents.forEach((other) => {
        if (other.id === agent.id || other.status !== "active") return;
        const dx = other.x - agent.x;
        const dy = other.y - agent.y;
        const dSq = dx * dx + dy * dy;
        if (dSq <= visionRadiusSq) neighborCount++;
        if (dSq < minDistAgentSq) minDistAgentSq = dSq;
      });
      const minDistAgent = Math.sqrt(minDistAgentSq);
      agent.neighborsCount = neighborCount;

      // Normalize inputs for neural network (0 to 1)
      const normResDist = minDistRes === Infinity ? 1.0 : Math.min(1.0, minDistRes / (config.worldWidth * 0.5));
      const relAngleRes = Math.atan2(Math.sin(angleToRes - agent.angle), Math.cos(angleToRes - agent.angle)) / Math.PI; // -1 to 1
      const normAgentDist = minDistAgent === Infinity ? 1.0 : Math.min(1.0, minDistAgent / config.visionRadius);
      const normEnergy = agent.energy / agent.maxEnergy;
      const normBelief = agent.belief;
      const normLight = this.dayNightLight;

      const nnInputs = [normResDist, relAngleRes, normAgentDist, normEnergy, normBelief, normLight];

      // Execute Neural Forward Pass
      const [steer, throttle, harvestEffort] = forwardNeuralNetwork(agent.brain, nnInputs);

      // Movement & Physics
      agent.angle += steer * 0.12; // Turn steer rate
      agent.speed = Math.max(0.2, throttle * 2.8);

      const dx = Math.cos(agent.angle) * agent.speed;
      const dy = Math.sin(agent.angle) * agent.speed;

      // Save current position to motion trail
      if (!agent.trail) agent.trail = [];
      agent.trail.push({ x: agent.x, y: agent.y });
      if (agent.trail.length > 8) {
        agent.trail.shift();
      }

      agent.x += dx;
      agent.y += dy;
      agent.distanceTraveled += Math.sqrt(dx * dx + dy * dy);

      // Bounce off walls
      if (agent.x < agent.radius) {
        agent.x = agent.radius;
        agent.angle = Math.PI - agent.angle;
      } else if (agent.x > config.worldWidth - agent.radius) {
        agent.x = config.worldWidth - agent.radius;
        agent.angle = Math.PI - agent.angle;
      }

      if (agent.y < agent.radius) {
        agent.y = agent.radius;
        agent.angle = -agent.angle;
      } else if (agent.y > config.worldHeight - agent.radius) {
        agent.y = config.worldHeight - agent.radius;
        agent.angle = -agent.angle;
      }

      // Energy Consumption (Base rate + speed cost + harvest effort)
      const energyCost = 0.06 + agent.speed * 0.05 + harvestEffort * 0.03;
      agent.energy -= energyCost;

      // Harvest Energy from nearby active resources
      activeResources.forEach((res) => {
        const rDx = res.x - agent.x;
        const rDy = res.y - agent.y;
        const rDist = Math.sqrt(rDx * rDx + rDy * rDy);

        if (rDist <= agent.radius + res.radius) {
          const harvestAmount = Math.min(res.currentEnergy, 1.8 * harvestEffort + 0.5);
          res.currentEnergy -= harvestAmount;
          agent.energy = Math.min(agent.maxEnergy, agent.energy + harvestAmount);
          agent.resourcesGathered += harvestAmount;

          if (res.currentEnergy <= 0) {
            res.active = false;
            res.respawnTimer = Math.floor(150 / config.resourceRegenRate);
            agent.biographyLogs.unshift({
              id: Math.random().toString(36).substring(2, 9),
              tick: this.currentTick,
              type: "harvest",
              message: `Harvested and fully depleted Resource Node #${res.id} (+${harvestAmount.toFixed(1)} Energy). Total gathered: ${agent.resourcesGathered.toFixed(0)}.`,
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      });


      
      // --- Cannibalism / Backstabbing Mechanic ---
      if (agent.energy < 25 && (agent.factionId === 0 || agent.factionId === 1)) {
         this.agents.forEach((target) => {
            if (target.id !== agent.id && target.status === "active" && target.factionId === agent.factionId) {
               const sdx = target.x - agent.x;
               const sdy = target.y - agent.y;
               const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
               // If very close and random chance triggers
               if (sdist < agent.radius * 3 && globalPRNG.nextFloat(0, 1) < 0.05) {
                   const stealAmount = 100;
                   target.energy -= stealAmount;
                   agent.energy = Math.min(agent.maxEnergy, agent.energy + stealAmount);
                   
                   // Psychological break
                   agent.belief = 1.0;
                   agent.factionId = 3; // Turns into a Rebel/Murderer
                   
                   agent.biographyLogs.unshift({
                      id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
                      tick: this.currentTick,
                      type: "influence",
                      message: `BETRAYAL: Cannibalized fellow Citizen #${target.id} for survival. Stole ${stealAmount} Energy.`,
                      timestamp: new Date().toLocaleTimeString(),
                   });
                   
                   target.biographyLogs.unshift({
                      id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
                      tick: this.currentTick,
                      type: "influence",
                      message: `BACKSTABBED: Betrayed by Agent #${agent.id}. Lost ${stealAmount} Energy.`,
                      timestamp: new Date().toLocaleTimeString(),
                   });
                   
                   this.addLog("belief", `🗡️ BETRAYAL: Agent #${agent.id} backstabbed #${target.id} for survival!`);
               }
            }
         });
      }

      // --- Rebel Stealing Mechanic ---
      if (agent.factionId === 3) {
         this.agents.forEach((target) => {
            if (target.id !== agent.id && target.status === "active" && target.factionId !== 3) {
               const sdx = target.x - agent.x;
               const sdy = target.y - agent.y;
               const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
               if (sdist < agent.radius * 2.5) {
                   const stealAmount = 2.0;
                   target.energy -= stealAmount;
                   agent.energy = Math.min(agent.maxEnergy, agent.energy + stealAmount);
                   
                   if (agent.lifetimeTicks % 60 === 0) {
                      agent.biographyLogs.unshift({
                         id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
                         tick: this.currentTick,
                         type: "influence",
                         message: `REBEL ACTION: Ambushed Agent #${target.id} and looted ${stealAmount} Energy.`,
                         timestamp: new Date().toLocaleTimeString(),
                      });
                   }
               }
            }
         });
      }

      // --- Reproduction Mechanic (Evolution) ---
      if (agent.energy > 160 && this.agents.length < config.agentCount * 1.5) {
         agent.energy -= 80;

         const childBrain = mutateNeuralNetwork(agent.brain, 0.2, 0.3);
         const childId = this.agents.length + 1;
         
         const child: Agent = {
            id: childId,
            x: agent.x + (globalPRNG.nextFloat(0, 1) - 0.5) * 10,
            y: agent.y + (globalPRNG.nextFloat(0, 1) - 0.5) * 10,
            vx: Math.cos(agent.angle + Math.PI),
            vy: Math.sin(agent.angle + Math.PI),
            angle: agent.angle + Math.PI,
            speed: 1.0,
            radius: 7,
            energy: 80,
            maxEnergy: 200,
            status: "active",
            respawnTimer: 0,
            brain: childBrain,
            belief: agent.belief,
            llr: agent.llr,
            isSleeper: false,
            isSleeperActivated: false,
            isImmune: globalPRNG.nextFloat(0, 1) < 0.2,
            factionId: agent.factionId,
            neighborsCount: 0,
            memoryStream: [`Agent #${childId} evolved from Parent #${agent.id} at Tick ${this.currentTick}.`],
            biographyLogs: [
              {
                id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
                tick: this.currentTick,
                type: "birth",
                message: `Born via natural reproduction. Inherited mutated neural weights from Parent #${agent.id}.`,
                timestamp: new Date().toLocaleTimeString(),
              },
            ],
            lastReflectionTick: 0,
            reflections: [],
            isReflecting: false,
            resourcesGathered: 0,
            lifetimeTicks: 0,
            distanceTraveled: 0,
            color: agent.color,
            trail: [],
         };
         this.agents.push(child);
         
         agent.biographyLogs.unshift({
            id: globalPRNG.nextFloat(0, 1).toString(36).substring(2, 9),
            tick: this.currentTick,
            type: "birth",
            message: `Reproduced! Spawned offspring Agent #${childId} (-80 Energy).`,
            timestamp: new Date().toLocaleTimeString(),
         });
         
         this.addLog("system", `🧬 Evolution: Agent #${agent.id} reproduced offspring #${childId}.`);
      }

      // Depletion / Death check
      if (agent.energy <= 0) {
        agent.energy = 0;
        agent.status = "depleted";
        agent.respawnTimer = 120; // 120 ticks before respawning
        this.addLog("system", `⚡ Agent #${agent.id} depleted all energy and halted.`);
        agent.biographyLogs.unshift({
          id: Math.random().toString(36).substring(2, 9),
          tick: this.currentTick,
          type: "depletion",
          message: `Energy depleted (0 HP). Entered 120-tick dormant hibernation state.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });

    
    // --- Evolutionary Defense Control Loop ---
    if (config.swMsrEnabled) {
      const activeAgents = this.agents.filter((a) => a.status === "active");
      const activeCount = activeAgents.length;
      if (activeCount > 1) {
        const avgBelief = activeAgents.reduce((sum, a) => sum + a.belief, 0) / activeCount;
        const variance = activeAgents.reduce((sum, a) => sum + Math.pow(a.belief - avgBelief, 2), 0) / activeCount;
        const stdDev = Math.sqrt(variance);
        const cohesion = Math.max(0, Math.min(1.0, 1.0 - stdDev * 2.2));
        
        if (cohesion < 0.6) {
            this.adaptiveFModifier = Math.min(0.40, this.adaptiveFModifier + 0.005);
        } else if (cohesion > 0.8) {
            this.adaptiveFModifier = Math.max(0.05, this.adaptiveFModifier - 0.001);
        }
        
        this.currentSocialCohesion = cohesion;
      }
    }
    // ----------------------------------------

    // 4. Layer 2 Belief Update & Defense
    const { beliefSpikes, defenseTriggers } = updateBeliefs(
      this.agents,
      config.swMsrEnabled,
      config.visionRadius,
      config.beliefDecay
    );

    if (beliefSpikes > 0) {
      this.addLog("belief", `⚠️ Misinformation spike detected affecting ${beliefSpikes} agents!`);
    }

    // 5. Layer 3 Network Topology
    if (this.currentTick % 5 === 0) {
      this.topology = calculateNetworkTopology(this.agents, config.visionRadius);
    }

    // 6. Record Metrics History for Live Charts (Every 3 ticks)
    if (this.currentTick % 3 === 0) {
      const activeAgents = this.agents.filter((a) => a.status === "active");
      const activeCount = activeAgents.length;
      const depletedCount = this.agents.filter((a) => a.status === "depleted" || a.status === "respawning").length;
      const sleeperCount = this.agents.filter((a) => a.isSleeper && a.isSleeperActivated).length;

      const avgEnergy = activeCount > 0 ? activeAgents.reduce((sum, a) => sum + a.energy, 0) / activeCount : 0;
      const avgBelief = activeCount > 0 ? activeAgents.reduce((sum, a) => sum + a.belief, 0) / activeCount : 0;

      // Calculate Social Cohesion Index based on belief variance across active agents
      let socialCohesion = 1.0;
      if (activeCount > 1) {
        const variance = activeAgents.reduce((sum, a) => sum + Math.pow(a.belief - avgBelief, 2), 0) / activeCount;
        const stdDev = Math.sqrt(variance);
        socialCohesion = Math.max(0, Math.min(1.0, 1.0 - stdDev * 2.2));
      }

      this.metricsHistory.push({
        tick: this.currentTick,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgBelief: Math.round(avgBelief * 100) / 100,
        socialCohesion: Math.round(socialCohesion * 100) / 100,
        activeCount,
        depletedCount,
        sleeperCount,
        fiedlerValue: this.topology.fiedlerValue,
      });

      if (this.metricsHistory.length > 100) {
        this.metricsHistory.shift();
      }
    }
  }


  public runBatchExperiment(ticksPerRun: number, config: SimulationConfig, numRuns: number = 3): string {
    const fullMetrics = [];
    
    for (let r = 0; r < numRuns; r++) {
      config.randomSeed = (config.randomSeed || 12345) + r * 1000;
      this.reset(config);
      let sleepersActivated = false;

      for (let i = 0; i < ticksPerRun; i++) {
        this.tick(config);
        
        if (this.currentTick === 50 && !sleepersActivated && config.sleeperRatio > 0) {
           this.toggleSleeperActivation();
           sleepersActivated = true;
        }

        const activeAgents = this.agents.filter((a) => a.status === "active");
        const activeCount = activeAgents.length;
        const depletedCount = this.agents.filter((a) => a.status === "depleted" || a.status === "respawning").length;
        const sleeperCount = this.agents.filter((a) => a.isSleeper && a.isSleeperActivated).length;

        const avgEnergy = activeCount > 0 ? activeAgents.reduce((sum, a) => sum + a.energy, 0) / activeCount : 0;
        const avgBelief = activeCount > 0 ? activeAgents.reduce((sum, a) => sum + a.belief, 0) / activeCount : 0;

        let socialCohesion = 1.0;
        if (activeCount > 1) {
          const variance = activeAgents.reduce((sum, a) => sum + Math.pow(a.belief - avgBelief, 2), 0) / activeCount;
          const stdDev = Math.sqrt(variance);
          socialCohesion = Math.max(0, Math.min(1.0, 1.0 - stdDev * 2.2));
        }

        fullMetrics.push({
          run_seed: config.randomSeed,
          tick: this.currentTick,
          avgEnergy: Math.round(avgEnergy * 10) / 10,
          avgBelief: Math.round(avgBelief * 100) / 100,
          socialCohesion: Math.round(socialCohesion * 100) / 100,
          activeCount,
          depletedCount,
          sleeperCount,
          fiedlerValue: this.topology.fiedlerValue,
          fModifier: this.adaptiveFModifier
        });
      }
    }

    const headers = ["run_seed", "tick", "avgEnergy", "avgBelief", "socialCohesion", "activeCount", "depletedCount", "sleeperCount", "fiedlerValue", "fModifier"];
    let csv = headers.join(",") + "\n";
    for (const m of fullMetrics) {
      csv += `${m.run_seed},${m.tick},${m.avgEnergy},${m.avgBelief},${m.socialCohesion},${m.activeCount},${m.depletedCount},${m.sleeperCount},${m.fiedlerValue},${m.fModifier.toFixed(3)}\n`;
    }
    
    return csv;
  }

  public runAgentMLBatchExperiment(ticksPerRun: number, config: SimulationConfig, numRuns: number = 5): string {
    const fullMetrics = [];
    
    for (let r = 0; r < numRuns; r++) {
      config.randomSeed = (config.randomSeed || 12345) + r * 1000;
      this.reset(config);
      let sleepersActivated = false;

      for (let i = 0; i < ticksPerRun; i++) {
        this.tick(config);
        
        if (this.currentTick === 50 && !sleepersActivated && config.sleeperRatio > 0) {
           this.toggleSleeperActivation();
           sleepersActivated = true;
        }

        // Sample agent behavior every 10 ticks
        if (this.currentTick % 10 === 0) {
          for (const a of this.agents) {
             if (a.status !== "active") continue;
             fullMetrics.push({
                run_seed: config.randomSeed,
                tick: this.currentTick,
                agentId: a.id,
                isSleeper: a.isSleeper ? 1 : 0,
                belief: a.belief.toFixed(4),
                llr: a.llr.toFixed(4),
                speed: a.speed.toFixed(3),
                energy: a.energy.toFixed(1),
                neighborsCount: a.neighborsCount,
                distanceTraveled: a.distanceTraveled.toFixed(1)
             });
          }
        }
      }
    }

    const headers = ["run_seed", "tick", "agentId", "isSleeper", "belief", "llr", "speed", "energy", "neighborsCount", "distanceTraveled"];
    let csv = headers.join(",") + "\n";
    for (const m of fullMetrics) {
      csv += `${m.run_seed},${m.tick},${m.agentId},${m.isSleeper},${m.belief},${m.llr},${m.speed},${m.energy},${m.neighborsCount},${m.distanceTraveled}\n`;
    }
    
    return csv;
  }

  public exportStateJSON(): string {
    const stateData = {
      tick: this.currentTick,
      dayNightLight: this.dayNightLight,
      topology: this.topology,
      agents: this.agents.map((a) => ({
        id: a.id,
        x: a.x,
        y: a.y,
        energy: a.energy,
        status: a.status,
        belief: a.belief,
        llr: a.llr,
        isSleeper: a.isSleeper,
        isSleeperActivated: a.isSleeperActivated,
        factionId: a.factionId,
        brain: a.brain,
        memoryStream: a.memoryStream,
        reflections: a.reflections,
      })),
      resources: this.resources,
    };
    return JSON.stringify(stateData, null, 2);
  }
}
