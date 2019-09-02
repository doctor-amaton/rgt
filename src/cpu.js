export default function CPU() {
  return {

    /**
     * Data state stack
     */
    state: [],

    /**
     * Execution stack
     */
    commands: [],

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
    r: {
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
    },

    /* Internal operations */

    /**
     * Preserve the state of the previously executed instruction
     */
    pushDataState(state = null) {
      const blob = state || { ...this.r };
      this.state.push(blob);
    },

    /**
     * Elapsed 1M time
     */
    m1() {
      /**
       * This instruction should have only taken 1 m (units) of time
       * and 4 units total
       */
      this.r.M = 1;
      this.r.T = 4;
    },

    /* Instruction implementation */

    /**
     * Add E to A, leaves the result in A (ADD A, E)
     */
    ADD_A_E() {
      this.pushDataState();

      /**
       * Preserve registers for nibble checking
       */
      const { A, E } = this.r;

      this.r.A += this.r.E;
      this.r.F = 0;

      /**
       * Check if the result was zero
       */
      if (!(this.r.A & 255)) { this.r.F |= 0x80; }

      /**
       * Check for carry
       */
      if (this.r.A > 255) { this.r.F |= 0x10; }

      /**
       * Check for half-carry
       */
      if ((A & 0xF) + (E & 0xF) & 0x10) { this.r.F |= 0x20; }

      /**
       * Mask to 8 bits
       */
      this.r.a &= 255;

      this.m1();
    },

    /**
     * Compare B to A, sets flags (CP A, B)
     */
    CP_A_B() {
      this.pushDataState();

      /**
       * Local copy of the state of A
       */
      let { A } = this.r;

      /**
       * Substraction
       */
      A -= this.r.B;

      /**
       * Set the substraction flag
       */
      this.r.F |= 0x40;

      /**
       * Test for 0
       */
      if (!(A & 255)) { this.r.F |= 0x80; }

      /**
       * Check underflow
       */
      if (A < 0) { this.r.F |= 0x10; }

      this.m1();
    },

    /**
     * No operation (different from not implemented)
     */
    NOP() {
      this.m1();
    },
  };
}
