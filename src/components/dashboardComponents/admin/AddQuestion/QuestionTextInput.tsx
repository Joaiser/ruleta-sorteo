import React from "react";

type Props = {
    questionText: string;
    setQuestionText: (text: string) => void;
};

export function QuestionTextInput({ questionText, setQuestionText }: Props) {
    return (
        <label className="block">
            <span className="text-gray-300 font-semibold mb-1 block">
                Texto de la pregunta:
            </span>
            <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-4 py-3 text-white resize-none"
                placeholder="Escribe la pregunta aquí..."
                required
            />
        </label>
    );
}
