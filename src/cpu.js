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

  /**
   * Unknown for now
   */
  R: 0,
  I: 0,
  IME: 0,
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
     * Check if we halt or stop
     */
    halt: 0,
    stop: 0,

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

      /**
       * Init the CB map
       */
      this.cbmap = [
        // CB00
        this._ops.RLCr_b,
        this._ops.RLCr_c,
        this._ops.RLCr_d,
        this._ops.RLCr_e,
        this._ops.RLCr_h,
        this._ops.RLCr_l,
        this._ops.RLCHL,
        this._ops.RLCr_a,
        this._ops.RRCr_b,
        this._ops.RRCr_c,
        this._ops.RRCr_d,
        this._ops.RRCr_e,
        this._ops.RRCr_h,
        this._ops.RRCr_l,
        this._ops.RRCHL,
        this._ops.RRCr_a,

        // CB10
        this._ops.RLr_b,
        this._ops.RLr_c,
        this._ops.RLr_d,
        this._ops.RLr_e,
        this._ops.RLr_h,
        this._ops.RLr_l,
        this._ops.RLHL,
        this._ops.RLr_a,
        this._ops.RRr_b,
        this._ops.RRr_c,
        this._ops.RRr_d,
        this._ops.RRr_e,
        this._ops.RRr_h,
        this._ops.RRr_l,
        this._ops.RRHL,
        this._ops.RRr_a,

        // CB20
        this._ops.SLAr_b,
        this._ops.SLAr_c,
        this._ops.SLAr_d,
        this._ops.SLAr_e,
        this._ops.SLAr_h,
        this._ops.SLAr_l,
        this._ops.XX,
        this._ops.SLAr_a,
        this._ops.SRAr_b,
        this._ops.SRAr_c,
        this._ops.SRAr_d,
        this._ops.SRAr_e,
        this._ops.SRAr_h,
        this._ops.SRAr_l,
        this._ops.XX,
        this._ops.SRAr_a,

        // CB30
        this._ops.SWAPr_b,
        this._ops.SWAPr_c,
        this._ops.SWAPr_d,
        this._ops.SWAPr_e,
        this._ops.SWAPr_h,
        this._ops.SWAPr_l,
        this._ops.XX,
        this._ops.SWAPr_a,
        this._ops.SRLr_b,
        this._ops.SRLr_c,
        this._ops.SRLr_d,
        this._ops.SRLr_e,
        this._ops.SRLr_h,
        this._ops.SRLr_l,
        this._ops.XX,
        this._ops.SRLr_a,

        // CB40
        this._ops.BIT0b,
        this._ops.BIT0c,
        this._ops.BIT0d,
        this._ops.BIT0e,
        this._ops.BIT0h,
        this._ops.BIT0l,
        this._ops.BIT0m,
        this._ops.BIT0a,
        this._ops.BIT1b,
        this._ops.BIT1c,
        this._ops.BIT1d,
        this._ops.BIT1e,
        this._ops.BIT1h,
        this._ops.BIT1l,
        this._ops.BIT1m,
        this._ops.BIT1a,

        // CB50
        this._ops.BIT2b,
        this._ops.BIT2c,
        this._ops.BIT2d,
        this._ops.BIT2e,
        this._ops.BIT2h,
        this._ops.BIT2l,
        this._ops.BIT2m,
        this._ops.BIT2a,
        this._ops.BIT3b,
        this._ops.BIT3c,
        this._ops.BIT3d,
        this._ops.BIT3e,
        this._ops.BIT3h,
        this._ops.BIT3l,
        this._ops.BIT3m,
        this._ops.BIT3a,

        // CB60
        this._ops.BIT4b,
        this._ops.BIT4c,
        this._ops.BIT4d,
        this._ops.BIT4e,
        this._ops.BIT4h,
        this._ops.BIT4l,
        this._ops.BIT4m,
        this._ops.BIT4a,
        this._ops.BIT5b,
        this._ops.BIT5c,
        this._ops.BIT5d,
        this._ops.BIT5e,
        this._ops.BIT5h,
        this._ops.BIT5l,
        this._ops.BIT5m,
        this._ops.BIT5a,

        // CB70
        this._ops.BIT6b,
        this._ops.BIT6c,
        this._ops.BIT6d,
        this._ops.BIT6e,
        this._ops.BIT6h,
        this._ops.BIT6l,
        this._ops.BIT6m,
        this._ops.BIT6a,
        this._ops.BIT7b,
        this._ops.BIT7c,
        this._ops.BIT7d,
        this._ops.BIT7e,
        this._ops.BIT7h,
        this._ops.BIT7l,
        this._ops.BIT7m,
        this._ops.BIT7a,

        // CB80
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CB90
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBA0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBB0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBC0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBD0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBE0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,

        // CBF0
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX,
        this._ops.XX
      ];
    },

    execute() {
      for (;;) {
        const op = this.mmu.rb(this.r.PC);
        this.r.PC += 1;

        this.pushDataState();

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

    /* Helper functions */
    fz(i, as) {
      this.r.F = 0;
      if (!(i & 255)) this.r.F |= 128;
      this.r.F |= as ? 0x40 : 0;
    },

    MAPcb() {
      const i = this.mmu.rb(this.r.PC);
      this.r.PC += 1;
      this.r.PC &= 65535;
      if (this.cbmap[i]) this.cbmap[i]();
      else window.alert(i);
    },

    XX() {
      const opc = this.r.PC - 1;
      window.alert(`Unimplemented instruction at £${opc.toString(16)}, stopping.`);
      this.stop = 1;
    },

    /* Instruction implementation */
    ops: {
      LDrr_bb() {
        this.r.B = this.r.B;
        this.mn(1);
      },
      LDrr_bc() {
        this.r.B = this.r.C;
        this.mn(1);
      },
      LDrr_bd() {
        this.r.B = this.r.D;
        this.mn(1);
      },
      LDrr_be() {
        this.r.B = this.r.E;
        this.mn(1);
      },
      LDrr_bh() {
        this.r.B = this.r.H;
        this.mn(1);
      },
      LDrr_bl() {
        this.r.B = this.r.L;
        this.mn(1);
      },
      LDrr_ba() {
        this.r.B = this.r.A;
        this.mn(1);
      },
      LDrr_cb() {
        this.r.C = this.r.B;
        this.mn(1);
      },
      LDrr_cc() {
        this.r.C = this.r.C;
        this.mn(1);
      },
      LDrr_cd() {
        this.r.C = this.r.D;
        this.mn(1);
      },
      LDrr_ce() {
        this.r.C = this.r.E;
        this.mn(1);
      },
      LDrr_ch() {
        this.r.C = this.r.H;
        this.mn(1);
      },
      LDrr_cl() {
        this.r.C = this.r.L;
        this.mn(1);
      },
      LDrr_ca() {
        this.r.C = this.r.A;
        this.mn(1);
      },
      LDrr_db() {
        this.r.D = this.r.B;
        this.mn(1);
      },
      LDrr_dc() {
        this.r.D = this.r.C;
        this.mn(1);
      },
      LDrr_dd() {
        this.r.D = this.r.D;
        this.mn(1);
      },
      LDrr_de() {
        this.r.D = this.r.E;
        this.mn(1);
      },
      LDrr_dh() {
        this.r.D = this.r.H;
        this.mn(1);
      },
      LDrr_dl() {
        this.r.D = this.r.L;
        this.mn(1);
      },
      LDrr_da() {
        this.r.D = this.r.A;
        this.mn(1);
      },
      LDrr_eb() {
        this.r.E = this.r.B;
        this.mn(1);
      },
      LDrr_ec() {
        this.r.E = this.r.C;
        this.mn(1);
      },
      LDrr_ed() {
        this.r.E = this.r.D;
        this.mn(1);
      },
      LDrr_ee() {
        this.r.E = this.r.E;
        this.mn(1);
      },
      LDrr_eh() {
        this.r.E = this.r.H;
        this.mn(1);
      },
      LDrr_el() {
        this.r.E = this.r.L;
        this.mn(1);
      },
      LDrr_ea() {
        this.r.E = this.r.A;
        this.mn(1);
      },
      LDrr_hb() {
        this.r.H = this.r.B;
        this.mn(1);
      },
      LDrr_hc() {
        this.r.H = this.r.C;
        this.mn(1);
      },
      LDrr_hd() {
        this.r.H = this.r.D;
        this.mn(1);
      },
      LDrr_he() {
        this.r.H = this.r.E;
        this.mn(1);
      },
      LDrr_hh() {
        this.r.H = this.r.H;
        this.mn(1);
      },
      LDrr_hl() {
        this.r.H = this.r.L;
        this.mn(1);
      },
      LDrr_ha() {
        this.r.H = this.r.A;
        this.mn(1);
      },
      LDrr_lb() {
        this.r.L = this.r.B;
        this.mn(1);
      },
      LDrr_lc() {
        this.r.L = this.r.C;
        this.mn(1);
      },
      LDrr_ld() {
        this.r.L = this.r.D;
        this.mn(1);
      },
      LDrr_le() {
        this.r.L = this.r.E;
        this.mn(1);
      },
      LDrr_lh() {
        this.r.L = this.r.H;
        this.mn(1);
      },
      LDrr_ll() {
        this.r.L = this.r.L;
        this.mn(1);
      },
      LDrr_la() {
        this.r.L = this.r.A;
        this.mn(1);
      },
      LDrr_ab() {
        this.r.A = this.r.B;
        this.mn(1);
      },
      LDrr_ac() {
        this.r.A = this.r.C;
        this.mn(1);
      },
      LDrr_ad() {
        this.r.A = this.r.D;
        this.mn(1);
      },
      LDrr_ae() {
        this.r.A = this.r.E;
        this.mn(1);
      },
      LDrr_ah() {
        this.r.A = this.r.H;
        this.mn(1);
      },
      LDrr_al() {
        this.r.A = this.r.L;
        this.mn(1);
      },
      LDrr_aa() {
        this.r.A = this.r.A;
        this.mn(1);
      },

      LDrHLm_b() {
        this.r.B = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_c() {
        this.r.C = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_d() {
        this.r.D = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_e() {
        this.r.E = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_h() {
        this.r.H = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_l() {
        this.r.L = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },
      LDrHLm_a() {
        this.r.A = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mn(2);
      },

      LDHLmr_b() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.B);
        this.mn(2);
      },
      LDHLmr_c() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.C);
        this.mn(2);
      },
      LDHLmr_d() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.D);
        this.mn(2);
      },
      LDHLmr_e() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.E);
        this.mn(2);
      },
      LDHLmr_h() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.H);
        this.mn(2);
      },
      LDHLmr_l() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.L);
        this.mn(2);
      },
      LDHLmr_a() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.A);
        this.mn(2);
      },

      LDrn_b() {
        this.r.B = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_c() {
        this.r.C = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_d() {
        this.r.D = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_e() {
        this.r.E = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_h() {
        this.r.H = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_l() {
        this.r.L = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },
      LDrn_a() {
        this.r.A = this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.mn(2);
      },

      LDHLmn() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.mmu.rb(this.r.PC));
        this.r.PC += 1;
        this.mn(3);
      },

      LDBCmA() {
        this.mmu.wb((this.r.B << 8) + this.r.C, this.r.A);
        this.mn(2);
      },
      LDDEmA() {
        this.mmu.wb((this.r.D << 8) + this.r.E, this.r.A);
        this.mn(2);
      },

      LDmmA() {
        this.mmu.wb(this.mmu.rw(this.r.PC), this.r.A);
        this.r.PC += 2;
        this.mn(4);
      },

      LDABCm() {
        this.r.A = this.mmu.rb((this.r.B << 8) + this.r.C);
        this.mn(2);
      },
      LDADEm() {
        this.r.A = this.mmu.rb((this.r.D << 8) + this.r.E);
        this.mn(2);
      },

      LDAmm() {
        this.r.A = this.mmu.rb(this.mmu.rw(this.r.PC));
        this.r.PC += 2;
        this.mn(4);
      },

      LDBCnn() {
        this.r.C = this.mmu.rb(this.r.PC);
        this.r.B = this.mmu.rb(this.r.PC + 1);
        this.r.PC += 2;
        this.mn(3);
      },
      LDDEnn() {
        this.r.E = this.mmu.rb(this.r.PC);
        this.r.D = this.mmu.rb(this.r.PC + 1);
        this.r.PC += 2;
        this.mn(3);
      },
      LDHLnn() {
        this.r.L = this.mmu.rb(this.r.PC);
        this.r.H = this.mmu.rb(this.r.PC + 1);
        this.r.PC += 2;
        this.mn(3);
      },
      LDSPnn() {
        this.r.SP = this.mmu.rw(this.r.PC);
        this.r.PC += 2;
        this.mn(3);
      },

      LDHLmm() {
        const i = this.mmu.rw(this.r.PC);
        this.r.PC += 2;
        this.r.L = this.mmu.rb(i);
        this.r.H = this.mmu.rb(i + 1);
        this.mn(5);
      },
      LDmmHL() {
        const i = this.mmu.rw(this.r.PC);
        this.r.PC += 2;
        this.mmu.ww(i, (this.r.H << 8) + this.r.L);
        this.mn(5);
      },

      LDHLIA() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.A);
        this.r.L = (this.r.L + 1) & 255;
        if (!this.r.L) this.r.H = (this.r.H + 1) & 255;
        this.mn(2);
      },
      LDAHLI() {
        this.r.A = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.L = (this.r.L + 1) & 255;
        if (!this.r.L) this.r.H = (this.r.H + 1) & 255;
        this.mn(2);
      },

      LDHLDA() {
        this.mmu.wb((this.r.H << 8) + this.r.L, this.r.A);
        this.r.L = (this.r.L - 1) & 255;
        if (this.r.L === 255) this.r.H = (this.r.H - 1) & 255;
        this.mn(2);
      },
      LDAHLD() {
        this.r.A = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.L = (this.r.L - 1) & 255;
        if (this.r.L === 255) this.r.H = (this.r.H - 1) & 255;
        this.mn(2);
      },

      LDAIOn() {
        this.r.A = this.mmu.rb(0xFF00 + this.mmu.rb(this.r.PC));
        this.r.PC += 1;
        this.mn(3);
      },
      LDIOnA() {
        this.mmu.wb(0xFF00 + this.mmu.rb(this.r.PC), this.r.A);
        this.r.PC += 1;
        this.mn(3);
      },
      LDAIOC() {
        this.r.A = this.mmu.rb(0xFF00 + this.r.C);
        this.mn(2);
      },
      LDIOCA() {
        this.mmu.wb(0xFF00 + this.r.C, this.r.A);
        this.mn(2);
      },

      LDHLSPn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        i += this.r.SP;
        this.r.H = (i >> 8) & 255;
        this.r.L = i & 255;
        this.mn(3);
      },

      SWAPr_b() {
        const tr = this.r.B;
        this.r.B = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_c() {
        const tr = this.r.C;
        this.r.C = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_d() {
        const tr = this.r.D;
        this.r.D = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_e() {
        const tr = this.r.E;
        this.r.E = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_h() {
        const tr = this.r.H;
        this.r.H = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_l() {
        const tr = this.r.L;
        this.r.L = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },
      SWAPr_a() {
        const tr = this.r.A;
        this.r.A = this.mmu.rb((this.r.H << 8) + this.r.L);
        this.mmu.wb((this.r.H << 8) + this.r.L, tr);
        this.mn(4);
      },

      /* Data processing */
      ADDr_b() {
        this.r.A += this.r.B;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_c() {
        this.r.A += this.r.C;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_d() {
        this.r.A += this.r.D;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_e() {
        this.r.A += this.r.E;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_h() {
        this.r.A += this.r.H;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_l() {
        this.r.A += this.r.L;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDr_a() {
        this.r.A += this.r.A;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADDHL() {
        this.r.A += this.mmu.rb((this.r.H << 8) + this.r.L);
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },
      ADDn() {
        this.r.A += this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },
      ADDHLBC() {
        let hl = (this.r.H << 8) + this.r.L;
        hl += (this.r.B << 8) + this.r.C;
        if (hl > 65535) this.r.F |= 0x10;
        else this.r.F &= 0xEF;
        this.r.H = (hl >> 8) & 255;
        this.r.L = hl & 255;
        this.mn(3);
      },
      ADDHLDE() {
        let hl = (this.r.H << 8) + this.r.L;
        hl += (this.r.D << 8) + this.r.E;
        if (hl > 65535) this.r.F |= 0x10;
        else this.r.F &= 0xEF;
        this.r.H = (hl >> 8) & 255;
        this.r.L = hl & 255;
        this.mn(3);
      },
      ADDHLHL() {
        let hl = (this.r.H << 8) + this.r.L;
        hl += (this.r.H << 8) + this.r.L;
        if (hl > 65535) this.r.F |= 0x10;
        else this.r.F &= 0xEF;
        this.r.H = (hl >> 8) & 255;
        this.r.L = hl & 255;
        this.mn(3);
      },
      ADDHLSP() {
        let hl = (this.r.H << 8) + this.r.L;
        hl += this.r.SP;
        if (hl > 65535) this.r.F |= 0x10;
        else this.r.F &= 0xEF;
        this.r.H = (hl >> 8) & 255;
        this.r.L = hl & 255;
        this.mn(3);
      },
      ADDSPn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.r.SP += i;
        this.mn(4);
      },

      ADCr_b() {
        this.r.A += this.r.B;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_c() {
        this.r.A += this.r.C;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_d() {
        this.r.A += this.r.D;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_e() {
        this.r.A += this.r.E;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_h() {
        this.r.A += this.r.H;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_l() {
        this.r.A += this.r.L;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCr_a() {
        this.r.A += this.r.A;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      ADCHL() {
        this.r.A += this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },
      ADCn() {
        this.r.A += this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.r.A += (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A);
        if (this.r.A > 255) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },

      SUBr_b() {
        this.r.A -= this.r.B;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_c() {
        this.r.A -= this.r.C;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_d() {
        this.r.A -= this.r.D;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_e() {
        this.r.A -= this.r.E;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_h() {
        this.r.A -= this.r.H;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_l() {
        this.r.A -= this.r.L;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBr_a() {
        this.r.A -= this.r.A;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SUBHL() {
        this.r.A -= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },
      SUBn() {
        this.r.A -= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },

      SBCr_b() {
        this.r.A -= this.r.B;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_c() {
        this.r.A -= this.r.C;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_d() {
        this.r.A -= this.r.D;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_e() {
        this.r.A -= this.r.E;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_h() {
        this.r.A -= this.r.H;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_l() {
        this.r.A -= this.r.L;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCr_a() {
        this.r.A -= this.r.A;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(1);
      },
      SBCHL() {
        this.r.A -= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },
      SBCn() {
        this.r.A -= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.r.A -= (this.r.F & 0x10) ? 1 : 0;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },

      CPr_b() {
        let i = this.r.A;
        i -= this.r.B;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_c() {
        let i = this.r.A;
        i -= this.r.C;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_d() {
        let i = this.r.A;
        i -= this.r.D;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_e() {
        let i = this.r.A;
        i -= this.r.E;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_h() {
        let i = this.r.A;
        i -= this.r.H;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_l() {
        let i = this.r.A;
        i -= this.r.L;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPr_a() {
        let i = this.r.A;
        i -= this.r.A;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(1);
      },
      CPHL() {
        let i = this.r.A;
        i -= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(2);
      },
      CPn() {
        let i = this.r.A;
        i -= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.ops.fz(i, 1);
        if (i < 0) this.r.F |= 0x10;
        i &= 255;
        this.mn(2);
      },

      ANDr_b() {
        this.r.A &= this.r.B;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_c() {
        this.r.A &= this.r.C;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_d() {
        this.r.A &= this.r.D;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_e() {
        this.r.A &= this.r.E;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_h() {
        this.r.A &= this.r.H;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_l() {
        this.r.A &= this.r.L;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDr_a() {
        this.r.A &= this.r.A;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ANDHL() {
        this.r.A &= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },
      ANDn() {
        this.r.A &= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },

      ORr_b() {
        this.r.A |= this.r.B;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_c() {
        this.r.A |= this.r.C;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_d() {
        this.r.A |= this.r.D;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_e() {
        this.r.A |= this.r.E;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_h() {
        this.r.A |= this.r.H;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_l() {
        this.r.A |= this.r.L;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORr_a() {
        this.r.A |= this.r.A;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      ORHL() {
        this.r.A |= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },
      ORn() {
        this.r.A |= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },

      XORr_b() {
        this.r.A ^= this.r.B;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_c() {
        this.r.A ^= this.r.C;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_d() {
        this.r.A ^= this.r.D;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_e() {
        this.r.A ^= this.r.E;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_h() {
        this.r.A ^= this.r.H;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_l() {
        this.r.A ^= this.r.L;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORr_a() {
        this.r.A ^= this.r.A;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      XORHL() {
        this.r.A ^= this.mmu.rb((this.r.H << 8) + this.r.L);
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },
      XORn() {
        this.r.A ^= this.mmu.rb(this.r.PC);
        this.r.PC += 1;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(2);
      },

      INCr_b() {
        this.r.B += 1;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.mn(1);
      },
      INCr_c() {
        this.r.C += 1;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.mn(1);
      },
      INCr_d() {
        this.r.D += 1;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.mn(1);
      },
      INCr_e() {
        this.r.E += 1;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.mn(1);
      },
      INCr_h() {
        this.r.H += 1;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.mn(1);
      },
      INCr_l() {
        this.r.L += 1;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.mn(1);
      },
      INCr_a() {
        this.r.A += 1;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      INCHLm() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L) + 1;
        i &= 255;
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.ops.fz(i);
        this.mn(3);
      },

      DECr_b() {
        this.r.B -= 1;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.mn(1);
      },
      DECr_c() {
        this.r.C -= 1;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.mn(1);
      },
      DECr_d() {
        this.r.D -= 1;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.mn(1);
      },
      DECr_e() {
        this.r.E -= 1;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.mn(1);
      },
      DECr_h() {
        this.r.H -= 1;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.mn(1);
      },
      DECr_l() {
        this.r.L -= 1;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.mn(1);
      },
      DECr_a() {
        this.r.A -= 1;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.mn(1);
      },
      DECHLm() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L) - 1;
        i &= 255;
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.ops.fz(i);
        this.mn(3);
      },

      INCBC() {
        this.r.C = (this.r.C + 1) & 255;
        if (!this.r.C) this.r.B = (this.r.B + 1) & 255;
        this.mn(1);
      },
      INCDE() {
        this.r.E = (this.r.E + 1) & 255;
        if (!this.r.E) this.r.D = (this.r.D + 1) & 255;
        this.mn(1);
      },
      INCHL() {
        this.r.L = (this.r.L + 1) & 255;
        if (!this.r.L) this.r.H = (this.r.H + 1) & 255;
        this.mn(1);
      },
      INCSP() {
        this.r.SP = (this.r.SP + 1) & 65535;
        this.mn(1);
      },

      DECBC() {
        this.r.C = (this.r.C - 1) & 255;
        if (this.r.C === 255) this.r.B = (this.r.B - 1) & 255;
        this.mn(1);
      },
      DECDE() {
        this.r.E = (this.r.E - 1) & 255;
        if (this.r.E === 255) this.r.D = (this.r.D - 1) & 255;
        this.mn(1);
      },
      DECHL() {
        this.r.L = (this.r.L - 1) & 255;
        if (this.r.L === 255) this.r.H = (this.r.H - 1) & 255;
        this.mn(1);
      },
      DECSP() {
        this.r.SP = (this.r.SP - 1) & 65535;
        this.mn(1);
      },

      /* -= 1- Bit manipulation  -= 1-*/
      BIT0b() {
        this.ops.fz(this.r.B & 0x01);
        this.mn(2);
      },
      BIT0c() {
        this.ops.fz(this.r.C & 0x01);
        this.mn(2);
      },
      BIT0d() {
        this.ops.fz(this.r.D & 0x01);
        this.mn(2);
      },
      BIT0e() {
        this.ops.fz(this.r.E & 0x01);
        this.mn(2);
      },
      BIT0h() {
        this.ops.fz(this.r.H & 0x01);
        this.mn(2);
      },
      BIT0l() {
        this.ops.fz(this.r.L & 0x01);
        this.mn(2);
      },
      BIT0a() {
        this.ops.fz(this.r.A & 0x01);
        this.mn(2);
      },
      BIT0m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x01);
        this.mn(3);
      },

      BIT1b() {
        this.ops.fz(this.r.B & 0x02);
        this.mn(2);
      },
      BIT1c() {
        this.ops.fz(this.r.C & 0x02);
        this.mn(2);
      },
      BIT1d() {
        this.ops.fz(this.r.D & 0x02);
        this.mn(2);
      },
      BIT1e() {
        this.ops.fz(this.r.E & 0x02);
        this.mn(2);
      },
      BIT1h() {
        this.ops.fz(this.r.H & 0x02);
        this.mn(2);
      },
      BIT1l() {
        this.ops.fz(this.r.L & 0x02);
        this.mn(2);
      },
      BIT1a() {
        this.ops.fz(this.r.A & 0x02);
        this.mn(2);
      },
      BIT1m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x02);
        this.mn(3);
      },

      BIT2b() {
        this.ops.fz(this.r.B & 0x04);
        this.mn(2);
      },
      BIT2c() {
        this.ops.fz(this.r.C & 0x04);
        this.mn(2);
      },
      BIT2d() {
        this.ops.fz(this.r.D & 0x04);
        this.mn(2);
      },
      BIT2e() {
        this.ops.fz(this.r.E & 0x04);
        this.mn(2);
      },
      BIT2h() {
        this.ops.fz(this.r.H & 0x04);
        this.mn(2);
      },
      BIT2l() {
        this.ops.fz(this.r.L & 0x04);
        this.mn(2);
      },
      BIT2a() {
        this.ops.fz(this.r.A & 0x04);
        this.mn(2);
      },
      BIT2m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x04);
        this.mn(3);
      },

      BIT3b() {
        this.ops.fz(this.r.B & 0x08);
        this.mn(2);
      },
      BIT3c() {
        this.ops.fz(this.r.C & 0x08);
        this.mn(2);
      },
      BIT3d() {
        this.ops.fz(this.r.D & 0x08);
        this.mn(2);
      },
      BIT3e() {
        this.ops.fz(this.r.E & 0x08);
        this.mn(2);
      },
      BIT3h() {
        this.ops.fz(this.r.H & 0x08);
        this.mn(2);
      },
      BIT3l() {
        this.ops.fz(this.r.L & 0x08);
        this.mn(2);
      },
      BIT3a() {
        this.ops.fz(this.r.A & 0x08);
        this.mn(2);
      },
      BIT3m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x08);
        this.mn(3);
      },

      BIT4b() {
        this.ops.fz(this.r.B & 0x10);
        this.mn(2);
      },
      BIT4c() {
        this.ops.fz(this.r.C & 0x10);
        this.mn(2);
      },
      BIT4d() {
        this.ops.fz(this.r.D & 0x10);
        this.mn(2);
      },
      BIT4e() {
        this.ops.fz(this.r.E & 0x10);
        this.mn(2);
      },
      BIT4h() {
        this.ops.fz(this.r.H & 0x10);
        this.mn(2);
      },
      BIT4l() {
        this.ops.fz(this.r.L & 0x10);
        this.mn(2);
      },
      BIT4a() {
        this.ops.fz(this.r.A & 0x10);
        this.mn(2);
      },
      BIT4m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x10);
        this.mn(3);
      },

      BIT5b() {
        this.ops.fz(this.r.B & 0x20);
        this.mn(2);
      },
      BIT5c() {
        this.ops.fz(this.r.C & 0x20);
        this.mn(2);
      },
      BIT5d() {
        this.ops.fz(this.r.D & 0x20);
        this.mn(2);
      },
      BIT5e() {
        this.ops.fz(this.r.E & 0x20);
        this.mn(2);
      },
      BIT5h() {
        this.ops.fz(this.r.H & 0x20);
        this.mn(2);
      },
      BIT5l() {
        this.ops.fz(this.r.L & 0x20);
        this.mn(2);
      },
      BIT5a() {
        this.ops.fz(this.r.A & 0x20);
        this.mn(2);
      },
      BIT5m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x20);
        this.mn(3);
      },

      BIT6b() {
        this.ops.fz(this.r.B & 0x40);
        this.mn(2);
      },
      BIT6c() {
        this.ops.fz(this.r.C & 0x40);
        this.mn(2);
      },
      BIT6d() {
        this.ops.fz(this.r.D & 0x40);
        this.mn(2);
      },
      BIT6e() {
        this.ops.fz(this.r.E & 0x40);
        this.mn(2);
      },
      BIT6h() {
        this.ops.fz(this.r.H & 0x40);
        this.mn(2);
      },
      BIT6l() {
        this.ops.fz(this.r.L & 0x40);
        this.mn(2);
      },
      BIT6a() {
        this.ops.fz(this.r.A & 0x40);
        this.mn(2);
      },
      BIT6m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x40);
        this.mn(3);
      },

      BIT7b() {
        this.ops.fz(this.r.B & 0x80);
        this.mn(2);
      },
      BIT7c() {
        this.ops.fz(this.r.C & 0x80);
        this.mn(2);
      },
      BIT7d() {
        this.ops.fz(this.r.D & 0x80);
        this.mn(2);
      },
      BIT7e() {
        this.ops.fz(this.r.E & 0x80);
        this.mn(2);
      },
      BIT7h() {
        this.ops.fz(this.r.H & 0x80);
        this.mn(2);
      },
      BIT7l() {
        this.ops.fz(this.r.L & 0x80);
        this.mn(2);
      },
      BIT7a() {
        this.ops.fz(this.r.A & 0x80);
        this.mn(2);
      },
      BIT7m() {
        this.ops.fz(this.mmu.rb((this.r.H << 8) + this.r.L) & 0x80);
        this.mn(3);
      },

      RLA() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) + ci;
        this.r.A &= 255;
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(1);
      },
      RLCA() {
        const ci = this.r.A & 0x80 ? 1 : 0;
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) + ci;
        this.r.A &= 255;
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(1);
      },
      RRA() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = (this.r.A >> 1) + ci;
        this.r.A &= 255;
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(1);
      },
      RRCA() {
        const ci = this.r.A & 1 ? 0x80 : 0;
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = (this.r.A >> 1) + ci;
        this.r.A &= 255;
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(1);
      },

      RLr_b() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.B & 0x80 ? 0x10 : 0;
        this.r.B = (this.r.B << 1) + ci;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_c() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.C & 0x80 ? 0x10 : 0;
        this.r.C = (this.r.C << 1) + ci;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_d() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.D & 0x80 ? 0x10 : 0;
        this.r.D = (this.r.D << 1) + ci;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_e() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.E & 0x80 ? 0x10 : 0;
        this.r.E = (this.r.E << 1) + ci;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_h() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.H & 0x80 ? 0x10 : 0;
        this.r.H = (this.r.H << 1) + ci;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_l() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.L & 0x80 ? 0x10 : 0;
        this.r.L = (this.r.L << 1) + ci;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLr_a() {
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) + ci;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLHL() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L);
        const ci = this.r.F & 0x10 ? 1 : 0;
        const co = i & 0x80 ? 0x10 : 0;
        i = (i << 1) + ci;
        i &= 255;
        this.ops.fz(i);
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(4);
      },

      RLCr_b() {
        const ci = this.r.B & 0x80 ? 1 : 0;
        const co = this.r.B & 0x80 ? 0x10 : 0;
        this.r.B = (this.r.B << 1) + ci;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_c() {
        const ci = this.r.C & 0x80 ? 1 : 0;
        const co = this.r.C & 0x80 ? 0x10 : 0;
        this.r.C = (this.r.C << 1) + ci;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_d() {
        const ci = this.r.D & 0x80 ? 1 : 0;
        const co = this.r.D & 0x80 ? 0x10 : 0;
        this.r.D = (this.r.D << 1) + ci;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_e() {
        const ci = this.r.E & 0x80 ? 1 : 0;
        const co = this.r.E & 0x80 ? 0x10 : 0;
        this.r.E = (this.r.E << 1) + ci;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_h() {
        const ci = this.r.H & 0x80 ? 1 : 0;
        const co = this.r.H & 0x80 ? 0x10 : 0;
        this.r.H = (this.r.H << 1) + ci;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_l() {
        const ci = this.r.L & 0x80 ? 1 : 0;
        const co = this.r.L & 0x80 ? 0x10 : 0;
        this.r.L = (this.r.L << 1) + ci;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCr_a() {
        const ci = this.r.A & 0x80 ? 1 : 0;
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) + ci;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RLCHL() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L);
        const ci = i & 0x80 ? 1 : 0;
        const co = i & 0x80 ? 0x10 : 0;
        i = (i << 1) + ci;
        i &= 255;
        this.ops.fz(i);
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(4);
      },

      RRr_b() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.B & 1 ? 0x10 : 0;
        this.r.B = (this.r.B >> 1) + ci;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_c() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.C & 1 ? 0x10 : 0;
        this.r.C = (this.r.C >> 1) + ci;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_d() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.D & 1 ? 0x10 : 0;
        this.r.D = (this.r.D >> 1) + ci;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_e() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.E & 1 ? 0x10 : 0;
        this.r.E = (this.r.E >> 1) + ci;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_h() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.H & 1 ? 0x10 : 0;
        this.r.H = (this.r.H >> 1) + ci;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_l() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.L & 1 ? 0x10 : 0;
        this.r.L = (this.r.L >> 1) + ci;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRr_a() {
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = (this.r.A >> 1) + ci;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRHL() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L);
        const ci = this.r.F & 0x10 ? 0x80 : 0;
        const co = i & 1 ? 0x10 : 0;
        i = (i >> 1) + ci;
        i &= 255;
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.ops.fz(i);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(4);
      },

      RRCr_b() {
        const ci = this.r.B & 1 ? 0x80 : 0;
        const co = this.r.B & 1 ? 0x10 : 0;
        this.r.B = (this.r.B >> 1) + ci;
        this.r.B &= 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_c() {
        const ci = this.r.C & 1 ? 0x80 : 0;
        const co = this.r.C & 1 ? 0x10 : 0;
        this.r.C = (this.r.C >> 1) + ci;
        this.r.C &= 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_d() {
        const ci = this.r.D & 1 ? 0x80 : 0;
        const co = this.r.D & 1 ? 0x10 : 0;
        this.r.D = (this.r.D >> 1) + ci;
        this.r.D &= 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_e() {
        const ci = this.r.E & 1 ? 0x80 : 0;
        const co = this.r.E & 1 ? 0x10 : 0;
        this.r.E = (this.r.E >> 1) + ci;
        this.r.E &= 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_h() {
        const ci = this.r.H & 1 ? 0x80 : 0;
        const co = this.r.H & 1 ? 0x10 : 0;
        this.r.H = (this.r.H >> 1) + ci;
        this.r.H &= 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_l() {
        const ci = this.r.L & 1 ? 0x80 : 0;
        const co = this.r.L & 1 ? 0x10 : 0;
        this.r.L = (this.r.L >> 1) + ci;
        this.r.L &= 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCr_a() {
        const ci = this.r.A & 1 ? 0x80 : 0;
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = (this.r.A >> 1) + ci;
        this.r.A &= 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      RRCHL() {
        let i = this.mmu.rb((this.r.H << 8) + this.r.L);
        const ci = i & 1 ? 0x80 : 0;
        const co = i & 1 ? 0x10 : 0;
        i = (i >> 1) + ci;
        i &= 255;
        this.mmu.wb((this.r.H << 8) + this.r.L, i);
        this.ops.fz(i);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(4);
      },

      SLAr_b() {
        const co = this.r.B & 0x80 ? 0x10 : 0;
        this.r.B = (this.r.B << 1) & 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_c() {
        const co = this.r.C & 0x80 ? 0x10 : 0;
        this.r.C = (this.r.C << 1) & 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_d() {
        const co = this.r.D & 0x80 ? 0x10 : 0;
        this.r.D = (this.r.D << 1) & 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_e() {
        const co = this.r.E & 0x80 ? 0x10 : 0;
        this.r.E = (this.r.E << 1) & 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_h() {
        const co = this.r.H & 0x80 ? 0x10 : 0;
        this.r.H = (this.r.H << 1) & 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_l() {
        const co = this.r.L & 0x80 ? 0x10 : 0;
        this.r.L = (this.r.L << 1) & 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLAr_a() {
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) & 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },

      SLLr_b() {
        const co = this.r.B & 0x80 ? 0x10 : 0;
        this.r.B = (this.r.B << 1) & 255 + 1;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_c() {
        const co = this.r.C & 0x80 ? 0x10 : 0;
        this.r.C = (this.r.C << 1) & 255 + 1;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_d() {
        const co = this.r.D & 0x80 ? 0x10 : 0;
        this.r.D = (this.r.D << 1) & 255 + 1;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_e() {
        const co = this.r.E & 0x80 ? 0x10 : 0;
        this.r.E = (this.r.E << 1) & 255 + 1;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_h() {
        const co = this.r.H & 0x80 ? 0x10 : 0;
        this.r.H = (this.r.H << 1) & 255 + 1;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_l() {
        const co = this.r.L & 0x80 ? 0x10 : 0;
        this.r.L = (this.r.L << 1) & 255 + 1;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SLLr_a() {
        const co = this.r.A & 0x80 ? 0x10 : 0;
        this.r.A = (this.r.A << 1) & 255 + 1;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },

      SRAr_b() {
        const ci = this.r.B & 0x80;
        const co = this.r.B & 1 ? 0x10 : 0;
        this.r.B = ((this.r.B >> 1) + ci) & 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_c() {
        const ci = this.r.C & 0x80;
        const co = this.r.C & 1 ? 0x10 : 0;
        this.r.C = ((this.r.C >> 1) + ci) & 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_d() {
        const ci = this.r.D & 0x80;
        const co = this.r.D & 1 ? 0x10 : 0;
        this.r.D = ((this.r.D >> 1) + ci) & 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_e() {
        const ci = this.r.E & 0x80;
        const co = this.r.E & 1 ? 0x10 : 0;
        this.r.E = ((this.r.E >> 1) + ci) & 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_h() {
        const ci = this.r.H & 0x80;
        const co = this.r.H & 1 ? 0x10 : 0;
        this.r.H = ((this.r.H >> 1) + ci) & 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_l() {
        const ci = this.r.L & 0x80;
        const co = this.r.L & 1 ? 0x10 : 0;
        this.r.L = ((this.r.L >> 1) + ci) & 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRAr_a() {
        const ci = this.r.A & 0x80;
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = ((this.r.A >> 1) + ci) & 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },

      SRLr_b() {
        const co = this.r.B & 1 ? 0x10 : 0;
        this.r.B = (this.r.B >> 1) & 255;
        this.ops.fz(this.r.B);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_c() {
        const co = this.r.C & 1 ? 0x10 : 0;
        this.r.C = (this.r.C >> 1) & 255;
        this.ops.fz(this.r.C);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_d() {
        const co = this.r.D & 1 ? 0x10 : 0;
        this.r.D = (this.r.D >> 1) & 255;
        this.ops.fz(this.r.D);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_e() {
        const co = this.r.E & 1 ? 0x10 : 0;
        this.r.E = (this.r.E >> 1) & 255;
        this.ops.fz(this.r.E);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_h() {
        const co = this.r.H & 1 ? 0x10 : 0;
        this.r.H = (this.r.H >> 1) & 255;
        this.ops.fz(this.r.H);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_l() {
        const co = this.r.L & 1 ? 0x10 : 0;
        this.r.L = (this.r.L >> 1) & 255;
        this.ops.fz(this.r.L);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },
      SRLr_a() {
        const co = this.r.A & 1 ? 0x10 : 0;
        this.r.A = (this.r.A >> 1) & 255;
        this.ops.fz(this.r.A);
        this.r.F = (this.r.F & 0xEF) + co;
        this.mn(2);
      },

      CPL() {
        this.r.A = (~this.r.A) & 255;
        this.ops.fz(this.r.A, 1);
        this.mn(1);
      },
      NEG() {
        this.r.A = 0 - this.r.A;
        this.ops.fz(this.r.A, 1);
        if (this.r.A < 0) this.r.F |= 0x10;
        this.r.A &= 255;
        this.mn(2);
      },

      CCF() {
        const ci = this.r.F & 0x10 ? 0 : 0x10;
        this.r.F = (this.r.F & 0xEF) + ci;
        this.mn(1);
      },
      SCF() {
        this.r.F |= 0x10;
        this.mn(1);
      },

      /* -= 1- Stack  -= 1-*/
      PUSHBC() {
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.B);
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.C);
        this.mn(3);
      },
      PUSHDE() {
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.D);
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.E);
        this.mn(3);
      },
      PUSHHL() {
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.H);
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.L);
        this.mn(3);
      },
      PUSHAF() {
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.A);
        this.r.SP -= 1;
        this.mmu.wb(this.r.SP, this.r.F);
        this.mn(3);
      },

      POPBC() {
        this.r.C = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.r.B = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.mn(3);
      },
      POPDE() {
        this.r.E = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.r.D = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.mn(3);
      },
      POPHL() {
        this.r.L = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.r.H = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.mn(3);
      },
      POPAF() {
        this.r.F = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.r.A = this.mmu.rb(this.r.SP);
        this.r.SP += 1;
        this.mn(3);
      },

      /* -= 1- Jump  -= 1-*/
      JPnn() {
        this.r.PC = this.mmu.rw(this.r.PC);
        this.mn(3);
      },
      JPHL() {
        this.r.PC = this.r.Hl;
        this.mn(1);
      },
      JPNZnn() {
        this.mn(3);
        if ((this.r.F & 0x80) === 0x00) {
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 1;
          this.r.T += 4;
        } else this.r.PC += 2;
      },
      JPZnn() {
        this.mn(3);
        if ((this.r.F & 0x80) === 0x80) {
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 1;
          this.r.T += 4;
        } else this.r.PC += 2;
      },
      JPNCnn() {
        this.mn(3);
        if ((this.r.F & 0x10) === 0x00) {
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 1;
          this.r.T += 4;
        } else this.r.PC += 2;
      },
      JPCnn() {
        this.mn(3);
        if ((this.r.F & 0x10) === 0x10) {
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 1;
          this.r.T += 4;
        } else this.r.PC += 2;
      },

      JRn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        this.r.PC += i;
        this.r.M += 1;
        this.r.T += 4;
      },
      JRNZn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        if ((this.r.F & 0x80) === 0x00) {
          this.r.PC += i;
          this.r.M += 1;
          this.r.T += 4;
        }
      },
      JRZn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        if ((this.r.F & 0x80) === 0x80) {
          this.r.PC += i;
          this.r.M += 1;
          this.r.T += 4;
        }
      },
      JRNCn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        if ((this.r.F & 0x10) === 0x00) {
          this.r.PC += i;
          this.r.M += 1;
          this.r.T += 4;
        }
      },
      JRCn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        if ((this.r.F & 0x10) === 0x10) {
          this.r.PC += i;
          this.r.M += 1;
          this.r.T += 4;
        }
      },

      DJNZn() {
        let i = this.mmu.rb(this.r.PC);
        if (i > 127) i = -((~i + 1) & 255);
        this.r.PC += 1;
        this.mn(2);
        this.r.B -= 1;
        if (this.r.B) {
          this.r.PC += i;
          this.r.M += 1;
          this.r.T += 4;
        }
      },

      CALLnn() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC + 2);
        this.r.PC = this.mmu.rw(this.r.PC);
        this.mn(5);
      },
      CALLNZnn() {
        this.mn(3);
        if ((this.r.F & 0x80) === 0x00) {
          this.r.SP -= 2;
          this.mmu.ww(this.r.SP, this.r.PC + 2);
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 2;
          this.r.T += 8;
        } else this.r.PC += 2;
      },
      CALLZnn() {
        this.mn(3);
        if ((this.r.F & 0x80) === 0x80) {
          this.r.SP -= 2;
          this.mmu.ww(this.r.SP, this.r.PC + 2);
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 2;
          this.r.T += 8;
        } else this.r.PC += 2;
      },
      CALLNCnn() {
        this.mn(3);
        if ((this.r.F & 0x10) === 0x00) {
          this.r.SP -= 2;
          this.mmu.ww(this.r.SP, this.r.PC + 2);
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 2;
          this.r.T += 8;
        } else this.r.PC += 2;
      },
      CALLCnn() {
        this.mn(3);
        if ((this.r.F & 0x10) === 0x10) {
          this.r.SP -= 2;
          this.mmu.ww(this.r.SP, this.r.PC + 2);
          this.r.PC = this.mmu.rw(this.r.PC);
          this.r.M += 2;
          this.r.T += 8;
        } else this.r.PC += 2;
      },

      RET() {
        this.r.PC = this.mmu.rw(this.r.SP);
        this.r.SP += 2;
        this.mn(3);
      },
      RETI() {
        this.r.IME = 1;
        this.r.PC = this.mmu.rw(this.r.SP);
        this.r.SP += 2;
        this.mn(3);
      },
      RETNZ() {
        this.mn(1);
        if ((this.r.F & 0x80) === 0x00) {
          this.r.PC = this.mmu.rw(this.r.SP);
          this.r.SP += 2;
          this.r.M += 2;
          this.r.T += 8;
        }
      },
      RETZ() {
        this.mn(1);
        if ((this.r.F & 0x80) === 0x80) {
          this.r.PC = this.mmu.rw(this.r.SP);
          this.r.SP += 2;
          this.r.M += 2;
          this.r.T += 8;
        }
      },
      RETNC() {
        this.mn(1);
        if ((this.r.F & 0x10) === 0x00) {
          this.r.PC = this.mmu.rw(this.r.SP);
          this.r.SP += 2;
          this.r.M += 2;
          this.r.T += 8;
        }
      },
      RETC() {
        this.mn(1);
        if ((this.r.F & 0x10) === 0x10) {
          this.r.PC = this.mmu.rw(this.r.SP);
          this.r.SP += 2;
          this.r.M += 2;
          this.r.T += 8;
        }
      },

      RST00() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x00;
        this.mn(3);
      },
      RST08() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x08;
        this.mn(3);
      },
      RST10() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x10;
        this.mn(3);
      },
      RST18() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x18;
        this.mn(3);
      },
      RST20() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x20;
        this.mn(3);
      },
      RST28() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x28;
        this.mn(3);
      },
      RST30() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x30;
        this.mn(3);
      },
      RST38() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x38;
        this.mn(3);
      },
      RST40() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x40;
        this.mn(3);
      },
      RST48() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x48;
        this.mn(3);
      },
      RST50() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x50;
        this.mn(3);
      },
      RST58() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x58;
        this.mn(3);
      },
      RST60() {
        this.r.SP -= 2;
        this.mmu.ww(this.r.SP, this.r.PC);
        this.r.PC = 0x60;
        this.mn(3);
      },

      NOP() {
        this.mn(1);
      },
      HALT() {
        this.halt = 1;
        this.mn(1);
      },

      DI() {
        this.r.IME = 0;
        this.mn(1);
      },
      EI() {
        this.r.IME = 1;
        this.mn(1);
      },
    },
  };
}
