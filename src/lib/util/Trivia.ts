import { promisified as p } from "phin";

export namespace Trivia {
  const BASE_URL = "https://opentdb.com/api.php";
  const CORRECT_TYPES: Type[] = ["boolean", "multiple"];

  /**
   * Get a multiple choice question.
   *
   * @returns {Promise<Trivia.MultipleChoiceTrivia>}
   */
  export async function multipleChoice(): Promise<MultipleChoiceTrivia> {
    const [result] = await getTrivia("multiple", 1);

    return {
      possibleAnswers: [
        result.correct_answer,
        ...result.incorrect_answers
      ].shuffle(),
      answer: result.correct_answer,
      question: result.question
    };
  }

  /**
   * Get a true/false question.
   *
   * @returns {Promise<Trivia.TrueFalseTrivia>}
   */
  export async function trueFalse(): Promise<TrueFalseTrivia> {
    const [result] = await getTrivia("boolean", 1);

    return {
      answer: result.correct_answer,
      question: result.question
    };
  }

  /**
   * Get trivia questions
   *
   * @param {T} type
   * @param {number} amount
   * @returns {Promise<Trivia.RawResult<T>[]>}
   */
  async function getTrivia<T extends Type>(
    type: T,
    amount: number
  ): Promise<RawResult<T>[]> {
    if (!CORRECT_TYPES.includes(type)) {
      throw new TypeError(`Unknown Trivia Type: ${type}`);
    }

    const { body } = await p<RawResponse<T>>({
      url: `${BASE_URL}?amount=${amount}&type=${type}`,
      parse: "json"
    });

    return body.results;
  }

  /* unions */
  type Type = "multiple" | "boolean";
  type Difficulty = "easy" | "medium" | "hard";
  type BooleanAnswers = "True" | "False";

  /* raw results */
  interface RawResponse<T extends Type> {
    response_code: number;
    results: RawResult<T>[];
  }

  interface RawResult<T extends Type> {
    category: string;
    type: T;
    difficulty: Difficulty;
    question: string;
    correct_answer: T extends "multiple" ? string : BooleanAnswers;
    incorrect_answers: T extends "multiple" ? string[] : [BooleanAnswers];
  }

  /* good schuff */
  export interface MultipleChoiceTrivia {
    question: string;
    answer: string;
    possibleAnswers: string[];
  }

  export interface TrueFalseTrivia {
    question: string;
    answer: BooleanAnswers;
  }
}
