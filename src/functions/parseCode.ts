export default function parseCode(code: string) {
  const regex = /(^```(js\n)?|```$)/g; // matches code blocks
  return code.replace(regex, "");
}
