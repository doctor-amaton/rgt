export default function MMU() {
  return {

    /**
     * Read 8-bit byte from a given address
     * @param  {word} address [To be read]
     * @return {byte}         [Accessed byte from memory]
     */
    rb(address) {},

    /**
     * Read 16-bit word from memory
     * @param  {short} address [Location of value]
     * @return {word}          [Accessed value]
     */
    rw(address) {},

    /**
     * Write 8-bit byte to address
     * @param  {word} address [Position to write memory]
     * @param  {byte} value   [Value to be stored]
     */
    wb(address, value) {},

    /**
     * Write 16-bit byte to address
     * @param  {word} address [Position to write memory]
     * @param  {word} value   [Value to be stored]
     */
    ww(address, value) {},
  };
}
