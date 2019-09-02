import MMU from './mmu';

const initial = {
  /**
   * General purpose, 8-bit registers
   */
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  E: 0,

  /**
   * Special registers, 8-bit wide
   */
  H: 0,
  L: 0,
  F: 0,

  /**
   * 16-bit special registers
   */
  PC: 0,
  SP: 0,

  /**
   * Public reference to the clocks
   */
  M: 0,
  T: 0,
};

export default function CPU() {
  return {

    /**
     * Memory Management Unit
     */
    mmu: null,

    /**
     * Data state stack
     */
    state: [],

    /**
     * Execution stack
     */
    commands: [],

    /**
     * Instruction function array
     */
    instructions: [],

    /**
     * Elapsed times
     */
    c: {
      m: 0,
      t: 0,
    },

    /**
     * Register state of the machine
     */
    r: { ...initial },

    /* Internal operations */

    /**
     * Initialize the CPU
     * @param  {MMU} mmu [Memory Management Unit for this execution]
     */
    init(mmu = null) {
      this.mmu = mmu || new MMU();

      /**
       * Init the instruction function array
       */
      this.instructions = [
        this.ADD_A_E,
        this.CP_A_B,
        this.PUSH_B_C,
        this.POP_H_L,
        this.LD_A_MEM,
        this.NOP,
      ];
    },

    execute() {
      for (;;) {
        const op = this.mmu.rb(this.r.PC);
        this.r.PC += 1;

        this.instructions[op]();
        this.r.PC &= 0xFFFF;

        this.c.m += this.r.M;
        this.c.t += this.r.T;
      }
    },

    /**
     * Preserve the state prior to execution
     * @param  {object} state [State holding the registers and memory]
     * TODO: Implement state for MMU
     */
    pushDataState(state = null) {
      const blob = state || { ...this.r };
      this.state.push(blob);
    },

    /**
     * Shorthand handle for the data state routine
     */
    pds(state = null) {
      this.pushDataState(state);
    },

    /**
     * Increase the clocks to n and 4n time units
     * @param  {Integer} n
     */
    mn(n) {
      /**
       * This instruction should have only taken 1 m (units) of time
       * and 4 units total
       */
      this.r.M = n * 1;
      this.r.T = n * 4;
    },

    /**
     * Reset the CPU state to the original default
     */
    reset() {
      this.r = { ...initial };
      this.c.m = 0;
      this.c.t = 0;
    },

    /* Instruction implementation */

    /* Load / Store between different registers */
    LDrr_bb() { this.pds(); this.r.B = this.r.B; this.mn(1); },
    LDrr_bc() { this.pds(); this.r.B = this.r.C; this.mn(1); },
    LDrr_bd() { this.pds(); this.r.B = this.r.D; this.mn(1); },
    LDrr_be() { this.pds(); this.r.B = this.r.E; this.mn(1); },
    LDrr_bh() { this.pds(); this.r.B = this.r.H; this.mn(1); },
    LDrr_bl() { this.pds(); this.r.B = this.r.L; this.mn(1); },
    LDrr_ba() { this.pds(); this.r.B = this.r.A; this.mn(1); },
    LDrr_cb() { this.pds(); this.r.C = this.r.B; this.mn(1); },
    LDrr_cc() { this.pds(); this.r.C = this.r.C; this.mn(1); },
    LDrr_cd() { this.pds(); this.r.C = this.r.D; this.mn(1); },
    LDrr_ce() { this.pds(); this.r.C = this.r.E; this.mn(1); },
    LDrr_ch() { this.pds(); this.r.C = this.r.H; this.mn(1); },
    LDrr_cl() { this.pds(); this.r.C = this.r.L; this.mn(1); },
    LDrr_ca() { this.pds(); this.r.C = this.r.A; this.mn(1); },
    LDrr_db() { this.pds(); this.r.D = this.r.B; this.mn(1); },
    LDrr_dc() { this.pds(); this.r.D = this.r.C; this.mn(1); },
    LDrr_dd() { this.pds(); this.r.D = this.r.D; this.mn(1); },
    LDrr_de() { this.pds(); this.r.D = this.r.E; this.mn(1); },
    LDrr_dh() { this.pds(); this.r.D = this.r.H; this.mn(1); },
    LDrr_dl() { this.pds(); this.r.D = this.r.L; this.mn(1); },
    LDrr_da() { this.pds(); this.r.D = this.r.A; this.mn(1); },
    LDrr_eb() { this.pds(); this.r.E = this.r.B; this.mn(1); },
    LDrr_ec() { this.pds(); this.r.E = this.r.C; this.mn(1); },
    LDrr_ed() { this.pds(); this.r.E = this.r.D; this.mn(1); },
    LDrr_ee() { this.pds(); this.r.E = this.r.E; this.mn(1); },
    LDrr_eh() { this.pds(); this.r.E = this.r.H; this.mn(1); },
    LDrr_el() { this.pds(); this.r.E = this.r.L; this.mn(1); },
    LDrr_ea() { this.pds(); this.r.E = this.r.A; this.mn(1); },
    LDrr_hb() { this.pds(); this.r.H = this.r.B; this.mn(1); },
    LDrr_hc() { this.pds(); this.r.H = this.r.C; this.mn(1); },
    LDrr_hd() { this.pds(); this.r.H = this.r.D; this.mn(1); },
    LDrr_he() { this.pds(); this.r.H = this.r.E; this.mn(1); },
    LDrr_hh() { this.pds(); this.r.H = this.r.H; this.mn(1); },
    LDrr_hl() { this.pds(); this.r.H = this.r.L; this.mn(1); },
    LDrr_ha() { this.pds(); this.r.H = this.r.A; this.mn(1); },
    LDrr_lb() { this.pds(); this.r.L = this.r.B; this.mn(1); },
    LDrr_lc() { this.pds(); this.r.L = this.r.C; this.mn(1); },
    LDrr_ld() { this.pds(); this.r.L = this.r.D; this.mn(1); },
    LDrr_le() { this.pds(); this.r.L = this.r.E; this.mn(1); },
    LDrr_lh() { this.pds(); this.r.L = this.r.H; this.mn(1); },
    LDrr_ll() { this.pds(); this.r.L = this.r.L; this.mn(1); },
    LDrr_la() { this.pds(); this.r.L = this.r.A; this.mn(1); },
    LDrr_ab() { this.pds(); this.r.A = this.r.B; this.mn(1); },
    LDrr_ac() { this.pds(); this.r.A = this.r.C; this.mn(1); },
    LDrr_ad() { this.pds(); this.r.A = this.r.D; this.mn(1); },
    LDrr_ae() { this.pds(); this.r.A = this.r.E; this.mn(1); },
    LDrr_ah() { this.pds(); this.r.A = this.r.H; this.mn(1); },
    LDrr_al() { this.pds(); this.r.A = this.r.L; this.mn(1); },
    LDrr_aa() { this.pds(); this.r.A = this.r.A; this.mn(1); },

    LDrHLm_b() { this.pds(); this.r.B = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_c() { this.pds(); this.r.C = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_d() { this.pds(); this.r.D = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_e() { this.pds(); this.r.E = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_h() { this.pds(); this.r.H = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_l() { this.pds(); this.r.L = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },
    LDrHLm_a() { this.pds(); this.r.A = this.mmu.rb((this.r.H << 8) + this.r.L); this.mn(2); },

    LDHLmr_b() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.B); this.mn(2); },
    LDHLmr_c() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.C); this.mn(2); },
    LDHLmr_d() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.D); this.mn(2); },
    LDHLmr_e() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.E); this.mn(2); },
    LDHLmr_h() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.H); this.mn(2); },
    LDHLmr_l() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.L); this.mn(2); },
    LDHLmr_a() { this.mmu.wb((this.r.H << 8) + this.r.L, this.r.A); this.mn(2); },

    LDrn_b() { this.r.B = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_c() { this.r.C = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_d() { this.r.D = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_e() { this.r.E = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_h() { this.r.H = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_l() { this.r.L = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },
    LDrn_a() { this.r.A = this.mmu.rb(this.r.PC); this.r.PC += 1; this.mn(2); },


  };
}
