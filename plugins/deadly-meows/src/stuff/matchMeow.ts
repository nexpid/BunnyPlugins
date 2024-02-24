// mrrowwwww :3
export const meowRegexes = [/\bmr*e?ow+\b/, /\bnya+\b/];

export default (str: string) => meowRegexes.some((x) => x.test(str));
