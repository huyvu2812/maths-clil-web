import React, { useMemo, useState } from "react";

const defaultFields = [
  {
    name: "message",
    type: "textarea",
    placeholder: "Leave a message...",
    rows: 3,
    className: "feedback-textarea",
  },
  {
    name: "name",
    type: "text",
    placeholder: "Your name",
  },
  {
    name: "email",
    type: "email",
    placeholder: "Your email (optional)",
  },
];

export default function FeedbackForm({
  title = "Questions & Feedback",
  buttonText = "Comment",
  fields = defaultFields,
  onSubmit,
  className = "",
  initialValues = {},
}) {
  const initialState = useMemo(
    () =>
      fields.reduce((acc, field) => {
        acc[field.name] = initialValues[field.name] ?? "";
        return acc;
      }, {}),
    [fields, initialValues],
  );

  const [formData, setFormData] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <section className={`feedback-section ${className}`.trim()}>
      <div className="feedback-shell">
        <h2 className="feedback-title">{title}</h2>

        <form className="feedback-form" onSubmit={handleSubmit}>
          {fields.map((field) => {
            const commonProps = {
              key: field.name,
              name: field.name,
              value: formData[field.name] ?? "",
              onChange: handleChange,
              placeholder: field.placeholder,
              className: `feedback-input ${field.className || ""}`.trim(),
            };

            if (field.type === "textarea") {
              return (
                <textarea
                  {...commonProps}
                  rows={field.rows || 3}
                  aria-label={field.placeholder}
                />
              );
            }

            return (
              <input
                {...commonProps}
                type={field.type || "text"}
                aria-label={field.placeholder}
              />
            );
          })}

          <div className="feedback-actions">
            <button type="submit" className="feedback-submit">
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
