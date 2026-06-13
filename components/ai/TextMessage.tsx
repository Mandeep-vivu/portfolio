export default function TextMessage({ content }: { content: string }) {
  return <div className="whitespace-pre-wrap">{content}</div>;
}
