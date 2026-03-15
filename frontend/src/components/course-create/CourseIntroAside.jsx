import robotImage from '../../assets/Robot-transparent.png'

function CourseIntroAside() {
  return (
    <aside className="hidden w-full items-center justify-center bg-gradient-to-b from-[#0a4d2f] via-[#1d6a49] to-[#5d9077] px-10 py-12 md:flex md:w-2/5">
      <div className="max-w-sm text-center text-white">
        <div className="mb-8 inline-flex rounded-[28px] border border-white/15 bg-white/90 p-6 shadow-2xl shadow-black/20">
          <img
            src={robotImage}
            alt="Course creation assistant"
            className="h-60 w-60 object-contain"
          />
        </div>

        <h2 className="text-4xl font-bold">Create new course</h2>
        <p className="mt-4 text-lg leading-8 text-white/90">
          Set up the core course details first, then continue to the next step
          for building the full course workflow inside ThinkBack AI.
        </p>
      </div>
    </aside>
  )
}

export default CourseIntroAside
