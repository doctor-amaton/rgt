export default function CPU() {
  return {

    /**
     * Elapsed times
     */
    clocks: {
      last_instruction: 0,
      total: 0,
    },

    /**
     * Register state of the machine
     */
    registers: {
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
  };
}
