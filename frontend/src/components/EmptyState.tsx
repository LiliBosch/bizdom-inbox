export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
