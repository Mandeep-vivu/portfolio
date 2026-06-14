import ResponsePresentation from "./ResponsePresentation";

export default function TextMessage({ content, isUser }: { content: string; isUser?: boolean }) {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
  return <ResponsePresentation content={content} />;
}
