import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackFormBuilder(){
  const [questions,setQuestions] = useState([]);
  const [text,setText] = useState("");
  const [type,setType] = useState("Open Ended");

  const addQuestion = ()=>{
    if(!text) return;
    setQuestions([...questions,{text,type}]);
    setText("");
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Top Green Header Bar */}
      <div className="bg-[#C4E8D3] w-full py-6 px-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#13462D]">Feedback Form</h1>
          <p className="text-gray-700 mt-1">
            Build a custom feedback form to collect insights from students in this Course
          </p>
        </div>

        <div className="flex gap-4">
          <Button className="bg-[#C4E8D3] text-[#13462D] border-2 border-[#13462D] px-6 py-2 rounded-xl hover:bg-[#b8dec8]">
            Save Draft
          </Button>

          <Button className="bg-[#13462D] text-white px-6 py-2 rounded-xl hover:opacity-90">
            Publish Form
          </Button>
        </div>
      </div>

      <div className="p-10">

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-8 space-y-6">

          <Card className="border">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Institution Course Information</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Course Name" />
                <Input placeholder="Feedback Form Title" />
              </div>

              <Textarea placeholder="Description about this feedback form" />

              <select className="border rounded-lg p-2 w-full">
                <option>General Course Feedback</option>
                <option>Exam Feedback</option>
                <option>Lab Feedback</option>
                <option>Day School Feedback</option>
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Add Question</h2>

              <Textarea
                placeholder="Enter your question text"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />

              <select
                className="border rounded-lg p-2 w-full"
                value={type}
                onChange={(e)=>setType(e.target.value)}
              >
                <option>Open Ended</option>
                <option>Multiple Choice</option>
                <option>Rating Scale</option>
                <option>Yes / No</option>
              </select>

              <Button onClick={addQuestion} className="bg-[#13462D] text-white px-6 py-2 rounded-xl">
                Add Question
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-lg mb-4">Created Questions</h2>

              <div className="space-y-3">
                {questions.map((q,i)=> (
                  <div key={i} className="p-4 border rounded-xl flex justify-between">
                    <div>
                      <p className="font-medium">{q.text}</p>
                      <p className="text-sm text-gray-500">Type: {q.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="col-span-4 space-y-6">

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-3xl font-bold text-[#13462D]">{questions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Button className="w-full bg-[#C4E8D3] text-[#13462D] border-2 border-[#13462D] rounded-xl py-2">
                Preview Form
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

      </div>

      {/* Bottom Green Bar */}
      <div className="bg-[#C4E8D3] w-full h-10 mt-10"></div>

    </div>
  )
}
