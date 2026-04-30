function CourseFormActions({
  onReset,
  onCancel,
  submitLabel = 'Save Course',
  cancelLabel = 'Cancel',
  hideSubmit = false,
  hideReset = false,
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {hideSubmit ? null : (
        <button
          type="submit"
          className="rounded-3xl bg-[#184d35] px-6 py-3 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(24,77,53,0.28)] transition hover:brightness-105"
        >
          {submitLabel}
        </button>
      )}
      {hideReset ? null : (
        <button
          type="button"
          onClick={onReset}
          className="rounded-3xl border border-[#cbd6cc] bg-white px-6 py-3 text-lg font-semibold text-[#184d35] shadow-sm transition hover:border-[#aebeaf] hover:bg-[#f7f8f4]"
        >
          Reset
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="rounded-3xl border border-[#cbd6cc] bg-white px-6 py-3 text-lg font-semibold text-[#184d35] shadow-sm transition hover:border-[#aebeaf] hover:bg-[#f7f8f4]"
      >
        {cancelLabel}
      </button>
    </div>
  )
}

export default CourseFormActions
