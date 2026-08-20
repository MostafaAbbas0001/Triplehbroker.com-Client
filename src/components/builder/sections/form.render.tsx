import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "./rendering";
import { numberValue, objectArray, stringValue } from "./rendering";

export function FormRendererBase({
  content,
  multiStep,
  context,
}: SectionRenderProps & { multiStep: boolean }) {
  const fields = objectArray(content["items"]);
  const stepNames = [...new Set(fields.map((field) => stringValue(field["step"]) || "Details"))];
  const [step, setStep] = useState(0);
  const visibleFields = multiStep
    ? fields.filter((field) => (stringValue(field["step"]) || "Details") === stepNames[step])
    : fields;
  const underline = !multiStep && stringValue(content["appearance"]) === "underline";
  const columns = Math.max(1, Math.min(2, numberValue(content["columns"], 1)));
  const optionalLabel = stringValue(content["optionalLabel"]);
  const fieldClass = underline
    ? "min-h-12 border-0 border-b border-border bg-transparent px-0 outline-none focus:border-primary"
    : "min-h-12 border border-border bg-background px-3 outline-none focus:border-primary";
  return (
    <div className="w-full max-w-3xl">
      <h2 className="type-h2">{stringValue(content["heading"])}</h2>
      {stringValue(content["intro"]) ? (
        <p className={cn("type-body mt-5", underline && "border-s border-primary ps-4 text-sm")}>
          {stringValue(content["intro"])}
        </p>
      ) : null}
      {multiStep ? (
        <div className="mt-8 flex gap-2" aria-label="Form progress">
          {stepNames.map((name, index) => (
            <span
              key={name}
              className={cn("h-1 flex-1", index <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      ) : null}
      <form
        className={cn("mt-8 grid gap-x-6 gap-y-7", columns === 2 && "sm:grid-cols-2")}
        action={`mailto:${stringValue(content["recipient"])}`}
        method="post"
        encType="text/plain"
      >
        {visibleFields.map((field, index) => {
          const type = stringValue(field["type"]) || "text";
          const name = stringValue(field["name"]) || `field-${index + 1}`;
          const label = stringValue(field["label"]);
          const configuredOptions = Array.isArray(field["options"])
            ? field["options"].map(stringValue)
            : stringValue(field["options"])
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean);
          const options =
            stringValue(field["source"]) === "solution-pages"
              ? context.solutionSummaries.map((solution) => solution.title)
              : configuredOptions;
          if (type === "checkbox-group")
            return (
              <fieldset key={`${name}-${index}`} className="col-span-full grid gap-3">
                <legend className="text-sm font-medium text-foreground">{label}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 border border-border p-4 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        name={name}
                        value={option}
                        required={field["required"] === true}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          return (
            <label
              key={`${name}-${index}`}
              className={cn(
                "grid gap-2 text-sm font-medium text-foreground",
                (type === "textarea" || columns === 1) && "col-span-full",
              )}
            >
              <span className={underline ? "type-label" : undefined}>{label}</span>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  required={field["required"] === true}
                  placeholder={stringValue(field["placeholder"])}
                  rows={5}
                  className={cn(fieldClass, underline ? "min-h-36 resize-y py-3" : "p-3")}
                />
              ) : type === "select" ? (
                <select name={name} required={field["required"] === true} className={fieldClass}>
                  <option value="">—</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type === "email" || type === "tel" ? type : "text"}
                  name={name}
                  required={field["required"] === true}
                  placeholder={stringValue(field["placeholder"])}
                  className={fieldClass}
                />
              )}{" "}
              {field["required"] !== true && optionalLabel ? (
                <span className="text-xs font-normal text-muted-foreground">{optionalLabel}</span>
              ) : null}
            </label>
          );
        })}
        {multiStep && step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="col-span-full justify-self-start text-primary"
          >
            Back
          </button>
        ) : null}
        {multiStep && step < stepNames.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value + 1)}
            className="col-span-full justify-self-start rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="col-span-full justify-self-start rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            {stringValue(content["submitLabel"]) || "Send"}
          </button>
        )}
      </form>
    </div>
  );
}

export function FormSectionRenderer(props: SectionRenderProps) {
  return <FormRendererBase {...props} multiStep={false} />;
}
