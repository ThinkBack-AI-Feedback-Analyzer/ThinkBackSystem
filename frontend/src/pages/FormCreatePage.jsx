import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackFormBuilder(){

  const templateSets = {
    Exam: [
      "Was the exam difficulty appropriate?",
      "Were the exam instructions clear?",
      "Did the exam cover the syllabus properly?",
      "Was enough time given to complete the exam?"
    ],
    Lab: [
      "Were lab sessions helpful for understanding concepts?",
      "Were the lab instructions clear?",
      "Was lab equipment adequate?",
      "How can lab sessions be improved?"
    ],
    Course: [
      "How would you rate the overall course?",
      "Was the course content well organized?",
      "Was the lecturer clear in teaching?",
      "What improvements would you suggest for the course?"
    ]
  };

  const [selectedType,setSelectedType] = useState("Exam");
  const [editableTemplates,setEditableTemplates] = useState(templateSets["Exam"]);
  const [questions,setQuestions] = useState([]);

  const [customText,setCustomText] = useState("");
  const [customType,setCustomType] = useState("Open Ended");
  const [options,setOptions] = useState([""]);
  const [starCount,setStarCount] = useState(5);

  const [formTitle,setFormTitle] = useState("");
  const [previewMode,setPreviewMode] = useState(false);

  const handleTypeChange = (type)=>{
    setSelectedType(type);
    setEditableTemplates(templateSets[type]);
  }

  const handleEditTemplate = (value,index)=>{
    const updated = [...editableTemplates];
    updated[index] = value;
    setEditableTemplates(updated);
  }

  const addAllQuestions = ()=>{
    const newQs = editableTemplates.map(q=>({text:q,type:"Open Ended",options:[]}));
    setQuestions([...questions,...newQs]);
  }

  const addOption = ()=> setOptions([...options,""]);

  const updateOption = (value,index)=>{
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  const deleteOption = (index)=>{
    const updated = options.filter((_,i)=>i!==index);
    setOptions(updated);
  }

  const addCustomQuestion = ()=>{
    if(!customText) return;

    let newQuestion = {
      text: customText,
      type: customType,
      options: []
    };

    if(customType === "Multiple Choice") newQuestion.options = options;
    if(customType === "Yes/No") newQuestion.options = ["Yes","No"];
    if(customType === "Rating") newQuestion.options = Array.from({length:starCount},(_,i)=>i+1);

    setQuestions([...questions,newQuestion]);
    setCustomText("");
    setOptions([""]);
  }

  const updateQuestion = (value,index)=>{
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  }

  const updateQuestionOption = (qIndex,opIndex,value)=>{
    const updated = [...questions];
    updated[qIndex].options[opIndex] = value;
    setQuestions(updated);
  }

  const addQuestionOption = (qIndex)=>{
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  }

  const deleteQuestionOption = (qIndex,opIndex)=>{
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_,i)=>i!==opIndex);
    setQuestions(updated);
  }

  const deleteQuestion = (index)=>{
    const updated = questions.filter((_,i)=>i!==index);
    setQuestions(updated);
  }

  const [answers,setAnswers] = useState({});

  const setRating = (qIndex,value)=>{
    setAnswers({...answers,[qIndex]:value});
  }

  if(previewMode){
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#13462D]">{formTitle || "Preview Form"}</h1>

        {questions.map((q,i)=> (
          <div key={i} className="mb-6 p-4 border rounded-xl shadow-sm">
            <p className="font-medium mb-3">{q.text}</p>

            {q.type === "Open Ended" && <Textarea placeholder="Your answer" />}

            {q.type === "Multiple Choice" && q.options.map((op,idx)=>(
              <label key={idx} className="flex items-center gap-2 mb-1 cursor-pointer">
                <input type="radio" name={`q-${i}`} /> <span>{op}</span>
              </label>
            ))}

            {q.type === "Yes/No" && ["Yes","No"].map((op,idx)=>(
              <label key={idx} className="flex items-center gap-2 mb-1 cursor-pointer">
                <input type="radio" name={`q-${i}`} /> <span>{op}</span>
              </label>
            ))}

            {q.type === "Rating" && (
              <div className="flex gap-2 text-2xl">
                {q.options.map((n)=> (
                  <span
                    key={n}
                    onClick={()=>setRating(i,n)}
                    className={`cursor-pointer ${answers[i] >= n ? "text-yellow-500" : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        <button onClick={()=>setPreviewMode(false)} className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition">Back to Edit</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="bg-[#C4E8D3] w-full py-6 px-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#13462D]">Feedback Form</h1>
          <p className="text-sm text-gray-700">Create and customize your feedback questionnaire</p>
        </div>

        <div className="flex gap-3">
          <button className="bg-[#C4E8D3] border-2 border-[#13462D] text-[#13462D] rounded-xl px-5 py-2 hover:bg-[#b2dcc4] transition">Save Draft</button>
          <button className="bg-[#13462D] text-white rounded-xl px-5 py-2 hover:bg-[#0f3a26] transition">Publish Form</button>
        </div>
      </div>

      <div className="p-10 grid grid-cols-12 gap-6">

        <div className="col-span-8 space-y-6">

          <Card>
            <CardContent className="pt-6 pb-6 px-6 space-y-4">
              <Input className="w-full block"
                placeholder="Feedback Form Title"
                value={formTitle}
                onChange={(e)=>setFormTitle(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6 px-6 space-y-4">
              <select className="border p-2 w-full rounded-lg" value={selectedType} onChange={(e)=>handleTypeChange(e.target.value)}>
                <option>Exam</option>
                <option>Lab</option>
                <option>Course</option>
              </select>

              {editableTemplates.map((q,i)=>(
                <Textarea className="w-full block" key={i} value={q} onChange={(e)=>handleEditTemplate(e.target.value,i)} />
              ))}

              <button onClick={addAllQuestions} className="bg-[#13462D] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a26] transition">Add Templates</button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-6 px-6 space-y-4">
              <Textarea className="w-full block"
                placeholder="Enter your question..."
                value={customText}
                onChange={(e)=>setCustomText(e.target.value)}
              />

              <select value={customType} onChange={(e)=>setCustomType(e.target.value)} className="border p-2 w-full rounded-lg">
                <option>Open Ended</option>
                <option>Multiple Choice</option>
                <option>Yes/No</option>
                <option>Rating</option>
              </select>

              {customType === "Multiple Choice" && (
                <div className="space-y-2">
                  {options.map((op,i)=>(
                    <div key={i} className="flex gap-2">
                      <Input className="w-full block" value={op} onChange={(e)=>updateOption(e.target.value,i)} placeholder={`Option ${i+1}`} />
                      <button onClick={()=>deleteOption(i)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition">X</button>
                    </div>
                  ))}
                  <button onClick={addOption} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Add Option</button>
                </div>
              )}

              {customType === "Rating" && (
                <div>
                  <label className="text-sm">Number of Stars</label>
                  <Input type="number" value={starCount} onChange={(e)=>setStarCount(Number(e.target.value))} />
                </div>
              )}

              <button onClick={addCustomQuestion} className="bg-[#13462D] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a26] transition">Add Question</button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {questions.map((q,i)=>(
                <div key={i} className="border p-4 mb-3 rounded-xl bg-gray-50 space-y-3">
                  <Textarea value={q.text} onChange={(e)=>updateQuestion(e.target.value,i)} />
                  <p className="text-sm">Type: {q.type}</p>

                  {q.type === "Multiple Choice" && (
                    <div className="space-y-2">
                      {q.options.map((op,idx)=>(
                        <div key={idx} className="flex gap-2">
                          <Input className="w-full block" value={op} onChange={(e)=>updateQuestionOption(i,idx,e.target.value)} />
                          <button onClick={()=>deleteQuestionOption(i,idx)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition">X</button>
                        </div>
                      ))}
                      <button onClick={()=>addQuestionOption(i)} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Add Option</button>
                    </div>
                  )}

                  <button onClick={()=>deleteQuestion(i)} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition">Delete Question</button>
                </div>
              ))}
            </CardContent>
          </Card>

          <button onClick={()=>setPreviewMode(true)} className="bg-[#13462D] text-white w-full py-3 text-lg rounded-xl">
            View Form Preview
          </button>

        </div>

        <div className="col-span-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Total Questions</p>
              <p className="text-2xl font-bold text-[#13462D]">{questions.length}</p>
            </CardContent>
          </Card>
        </div>

      </div>

      <div className="bg-[#C4E8D3] h-10 mt-10"></div>

    </div>
  )
}
