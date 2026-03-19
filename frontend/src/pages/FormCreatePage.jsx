import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "../components/common/DashboardSidebar";
import DashboardTopBar from "../components/common/DashboardTopBar";

export default function FeedbackFormBuilder() {
  const navigate = useNavigate();
  const [authState] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return { user: null, loading: false };
    }

    try {
      return { user: JSON.parse(storedUser), loading: false };
    } catch {
      return { user: null, loading: false };
    }
  });

  const templateSets = {
    Exam: [
      "Was the exam difficulty appropriate?",
      "Were the exam instructions clear?",
      "Did the exam cover the syllabus properly?",
      "Was enough time given to complete the exam?",
    ],
    Lab: [
      "Were lab sessions helpful for understanding concepts?",
      "Were the lab instructions clear?",
      "Was lab equipment adequate?",
      "How can lab sessions be improved?",
    ],
    Course: [
      "How would you rate the overall course?",
      "Was the course content well organized?",
      "Was the lecturer clear in teaching?",
      "What improvements would you suggest for the course?",
    ],
  };

  const [selectedType, setSelectedType] = useState("Exam");
  const [editableTemplates, setEditableTemplates] = useState(templateSets.Exam);
  const [questions, setQuestions] = useState([]);
  const [customText, setCustomText] = useState("");
  const [customType, setCustomType] = useState("Open Ended");
  const [options, setOptions] = useState([""]);
  const [starCount, setStarCount] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!authState.user) {
      navigate("/login");
      return;
    }

    if (authState.user.role !== "institution_admin") {
      navigate("/");
    }
  }, [authState.user, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const handleSidebarNavigation = useCallback((key) => {
    const routeMap = {
      dashboard: "/institution-dashboard",
      courses: "/course-create",
      feedback: "/feedbackForm",
      users: "/student-management",
    };

    const targetRoute = routeMap[key];

    if (targetRoute) {
      navigate(targetRoute);
    }
  }, [navigate]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setEditableTemplates(templateSets[type]);
  };

  const handleEditTemplate = (value, index) => {
    const updated = [...editableTemplates];
    updated[index] = value;
    setEditableTemplates(updated);
  };

  const addAllQuestions = () => {
    const newQuestions = editableTemplates.map((question) => ({
      text: question,
      type: "Open Ended",
      options: [],
    }));

    setQuestions([...questions, ...newQuestions]);
  };

  const addOption = () => setOptions([...options, ""]);

  const updateOption = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const deleteOption = (index) => {
    const updated = options.filter((_, optionIndex) => optionIndex !== index);
    setOptions(updated);
  };

  const addCustomQuestion = () => {
    if (!customText) return;

    const newQuestion = {
      text: customText,
      type: customType,
      options:
        customType === "Multiple Choice"
          ? options
          : customType === "Yes/No"
            ? ["Yes", "No"]
            : customType === "Rating"
              ? Array.from({ length: starCount }, (_, index) => index + 1)
              : [],
    };

    setQuestions([...questions, newQuestion]);
    setCustomText("");
    setOptions([""]);
  };

  const updateQuestion = (value, index) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addQuestionOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const deleteQuestionOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter(
      (_, currentIndex) => currentIndex !== optionIndex,
    );
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    const updated = questions.filter((_, questionIndex) => questionIndex !== index);
    setQuestions(updated);
  };

  const setRating = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: value });
  };

  if (!authState.user) {
    return <div className="loading">Loading...</div>;
  }

  if (previewMode) {
    return (
      <div className="dash-wrapper">
        <DashboardSidebar
          activeNav="feedback"
          onNavChange={handleSidebarNavigation}
          onLogout={handleLogout}
        />

        <main className="dashboard-main">
          <DashboardTopBar
            userName={authState.user.full_name}
            userEmail={authState.user.email}
            searchPlaceholder="Search feedback forms"
          />

          <section className="dashboard-page-intro px-4 pb-4 md:px-6 md:pb-6">
            <div className="mx-auto max-w-5xl rounded-[32px] bg-white px-6 py-8 shadow-md md:px-10">
              <h1 className="mb-6 text-3xl font-bold text-[#13462D]">
                {formTitle || "Preview Form"}
              </h1>

              {questions.map((question, index) => (
                <div key={index} className="mb-6 rounded-xl border p-4 shadow-sm">
                  <p className="mb-3 font-medium">{question.text}</p>

                  {question.type === "Open Ended" && <Textarea placeholder="Your answer" />}

                  {question.type === "Multiple Choice" &&
                    question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="mb-1 flex cursor-pointer items-center gap-2"
                      >
                        <input type="radio" name={`q-${index}`} />
                        <span>{option}</span>
                      </label>
                    ))}

                  {question.type === "Yes/No" &&
                    ["Yes", "No"].map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="mb-1 flex cursor-pointer items-center gap-2"
                      >
                        <input type="radio" name={`q-${index}`} />
                        <span>{option}</span>
                      </label>
                    ))}

                  {question.type === "Rating" && (
                    <div className="flex gap-2 text-2xl">
                      {question.options.map((rating) => (
                        <span
                          key={rating}
                          onClick={() => setRating(index, rating)}
                          className={`cursor-pointer ${answers[index] >= rating ? "text-yellow-500" : "text-gray-300"}`}
                        >
                          *
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={() => setPreviewMode(false)}
                className="rounded-lg border px-4 py-2 transition hover:bg-gray-100"
              >
                Back to Edit
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dash-wrapper">
      <DashboardSidebar
        activeNav="feedback"
        onNavChange={handleSidebarNavigation}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <DashboardTopBar
          userName={authState.user.full_name}
          userEmail={authState.user.email}
          searchPlaceholder="Search feedback forms"
        />

        <section className="dashboard-page-intro px-4 pb-4 md:px-6 md:pb-6">
          <div className="mx-auto mb-5 flex max-w-7xl flex-col gap-4 rounded-[24px] border border-[#d8e7dd] bg-white px-6 py-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#13462D] md:text-3xl">
                Feedback Form
              </h1>
              <p className="mt-2 text-sm text-gray-700 md:text-base">
                Create and customize your feedback questionnaire
              </p>
            </div>

            <div className="flex gap-3">
              <button className="rounded-xl border-2 border-[#13462D] bg-[#C4E8D3] px-5 py-2 text-[#13462D] transition hover:bg-[#b2dcc4]">
                Save Draft
              </button>
              <button className="rounded-xl bg-[#13462D] px-5 py-2 text-white transition hover:bg-[#0f3a26]">
                Publish Form
              </button>
            </div>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <Card>
                <CardContent className="space-y-4 px-6 pb-6 pt-6">
                  <Input
                    className="block w-full"
                    placeholder="Feedback Form Title"
                    value={formTitle}
                    onChange={(event) => setFormTitle(event.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 px-6 pb-6 pt-6">
                  <select
                    className="w-full rounded-lg border p-2"
                    value={selectedType}
                    onChange={(event) => handleTypeChange(event.target.value)}
                  >
                    <option>Exam</option>
                    <option>Lab</option>
                    <option>Course</option>
                  </select>

                  {editableTemplates.map((question, index) => (
                    <Textarea
                      className="block w-full"
                      key={index}
                      value={question}
                      onChange={(event) => handleEditTemplate(event.target.value, index)}
                    />
                  ))}

                  <button
                    onClick={addAllQuestions}
                    className="rounded-lg bg-[#13462D] px-4 py-2 text-white transition hover:bg-[#0f3a26]"
                  >
                    Add Templates
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 px-6 pb-6 pt-6">
                  <Textarea
                    className="block w-full"
                    placeholder="Enter your question..."
                    value={customText}
                    onChange={(event) => setCustomText(event.target.value)}
                  />

                  <select
                    value={customType}
                    onChange={(event) => setCustomType(event.target.value)}
                    className="w-full rounded-lg border p-2"
                  >
                    <option>Open Ended</option>
                    <option>Multiple Choice</option>
                    <option>Yes/No</option>
                    <option>Rating</option>
                  </select>

                  {customType === "Multiple Choice" && (
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            className="block w-full"
                            value={option}
                            onChange={(event) => updateOption(event.target.value, index)}
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            onClick={() => deleteOption(index)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addOption}
                        className="rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                      >
                        Add Option
                      </button>
                    </div>
                  )}

                  {customType === "Rating" && (
                    <div>
                      <label className="text-sm">Number of Stars</label>
                      <Input
                        type="number"
                        value={starCount}
                        onChange={(event) => setStarCount(Number(event.target.value))}
                      />
                    </div>
                  )}

                  <button
                    onClick={addCustomQuestion}
                    className="rounded-lg bg-[#13462D] px-4 py-2 text-white transition hover:bg-[#0f3a26]"
                  >
                    Add Question
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="mb-3 space-y-3 rounded-xl border bg-gray-50 p-4"
                    >
                      <Textarea
                        value={question.text}
                        onChange={(event) => updateQuestion(event.target.value, index)}
                      />
                      <p className="text-sm">Type: {question.type}</p>

                      {question.type === "Multiple Choice" && (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                className="block w-full"
                                value={option}
                                onChange={(event) =>
                                  updateQuestionOption(index, optionIndex, event.target.value)
                                }
                              />
                              <button
                                onClick={() => deleteQuestionOption(index, optionIndex)}
                                className="rounded-lg bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                              >
                                X
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addQuestionOption(index)}
                            className="rounded-lg bg-gray-200 px-4 py-2 transition hover:bg-gray-300"
                          >
                            Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => deleteQuestion(index)}
                        className="rounded-lg bg-red-700 px-4 py-2 text-white transition hover:bg-red-800"
                      >
                        Delete Question
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <button
                onClick={() => setPreviewMode(true)}
                className="w-full rounded-xl bg-[#13462D] py-3 text-lg text-white"
              >
                View Form Preview
              </button>
            </div>

            <div className="lg:col-span-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p>Total Questions</p>
                  <p className="text-2xl font-bold text-[#13462D]">{questions.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
