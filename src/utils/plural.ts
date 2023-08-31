const words = { inscrição: "inscrições", vaga: "vagas" };
type singular = keyof typeof words;

export default function plural(word: singular, amount: number) {
  if (amount === 1) {
    return `${amount} ${word}`;
  }
  return `${amount} ${words[word]}`;
}
