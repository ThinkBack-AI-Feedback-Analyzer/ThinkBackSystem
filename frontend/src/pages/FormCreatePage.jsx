import { useState } from 'react'

const cardClassName =
  'rounded-[28px] border border-[#d8e2d7] bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)]'

const inputClassName =
  'w-full rounded-[20px] border border-[#d1d9cf] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f2_100%)] px-4 py-3 text-base text-slate-800 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 hover:border-[#b9c8bc] hover:bg-white hover:shadow-md focus:border-[#185237] focus:bg-white focus:shadow-[0_0_0_4px_rgba(24,77,53,0.12),0_18px_36px_rgba(24,77,53,0.14)]'

function Card({ children, className = '' }) {
  return <section className={`${cardClassName} ${className}`}>{children}</section>
}

function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const baseClassName =
    'inline-flex items-center justify-center rounded-[20px] px-5 py-3 text-sm font-semibold transition duration-200'

  const variantClassName =
    variant === 'secondary'
      ? 'border border-[#184d35] bg-white text-[#184d35] hover:bg-[#f4f7f2]'
      : 'bg-[#184d35] text-white shadow-[0_16px_32px_rgba(24,77,53,0.2)] hover:-translate-y-0.5 hover:brightness-105'

  return (
    <button
      type={type}
      className={`${baseClassName} ${variantClassName} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function FeedbackFormBuilder() {
  const [questions, setQuestions] = useState([])
  const [text, setText] = useState('')
  const [type, setType] = useState('Open Ended')

  function addQuestion() {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    setQuestions((current) => [...current, { text: trimmedText, type }])
    setText('')
  }

  return (
    <div className="min-h-screen bg-[#f3f0e8] text-slate-900">
      <header className="border-b border-[#d7e4d8] bg-[linear-gradient(180deg,#dbefdf_0%,#cde6d3_100%)] px-6 py-6 shadow-sm sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#4f7a62]">
              Feedback Builder
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#13462d] sm:text-4xl">
              Create a course feedback form
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
              Build a tailored questionnaire for students, organize question
              types, and prepare the form for publishing.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary">Save Draft</Button>
            <Button>Publish Form</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <Card>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-[#184d35]">
                  Institution Course Information
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Set the course context and describe the purpose of this
                  feedback form.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Course Name"
                  className={inputClassName}
                />
                <input
                  type="text"
                  placeholder="Feedback Form Title"
                  className={inputClassName}
                />
              </div>

              <textarea
                placeholder="Description about this feedback form"
                className={`${inputClassName} mt-4 min-h-32 resize-y leading-7`}
              />

              <select className={`${inputClassName} mt-4 pr-10`}>
                <option>General Course Feedback</option>
                <option>Exam Feedback</option>
                <option>Lab Feedback</option>
                <option>Day School Feedback</option>
              </select>
            </Card>

            <Card>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-[#184d35]">
                  Add Question
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Draft each question and choose the response style your
                  students should see.
                </p>
              </div>

              <textarea
                placeholder="Enter your question text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                className={`${inputClassName} min-h-32 resize-y leading-7`}
              />

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <select
                  className={`${inputClassName} pr-10`}
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option>Open Ended</option>
                  <option>Multiple Choice</option>
                  <option>Rating Scale</option>
                  <option>Yes / No</option>
                </select>

                <Button className="sm:min-w-44" onClick={addQuestion}>
                  Add Question
                </Button>
              </div>
            </Card>

            <Card>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#184d35]">
                    Created Questions
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review the question list before publishing.
                  </p>
                </div>
                <span className="rounded-full bg-[#e5f1e7] px-4 py-2 text-sm font-semibold text-[#184d35]">
                  {questions.length} total
                </span>
              </div>

              <div className="space-y-3">
                {questions.length > 0 ? (
                  questions.map((question, index) => (
                    <div
                      key={`${question.text}-${index}`}
                      className="flex flex-col gap-3 rounded-[22px] border border-[#d9e2da] bg-[linear-gradient(180deg,#ffffff_0%,#f7faf6_100%)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {question.text}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Type: {question.type}
                        </p>
                      </div>
                      <span className="inline-flex rounded-full bg-[#eff6f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4f7a62]">
                        Q{index + 1}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#c8d5ca] bg-[#fbfcfa] px-5 py-10 text-center text-sm leading-7 text-slate-500">
                    No questions added yet. Start by writing your first student
                    feedback prompt above.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#56836c]">
                Overview
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Monitor form size and keep the survey focused for better
                response quality.
              </p>
              <div className="mt-6 rounded-[24px] bg-[linear-gradient(180deg,#eff7f1_0%,#dfeee3_100%)] px-5 py-6 text-center">
                <p className="text-sm text-slate-600">Total Questions</p>
                <p className="mt-3 text-4xl font-semibold text-[#13462d]">
                  {questions.length}
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-[#184d35]">
                Quick Actions
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Preview the structure before sending it to students.
              </p>
              <Button variant="secondary" className="mt-6 w-full">
                Preview Form
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <footer className="h-10 bg-[linear-gradient(180deg,#cde6d3_0%,#bcdcc7_100%)]" />
    </div>
  )
}
