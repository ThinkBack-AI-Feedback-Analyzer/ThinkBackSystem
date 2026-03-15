export const authBubbleStyles = Array.from({ length: 20 }, (_, index) => {
  const size = 12 + (index % 5) * 6

  return {
    left: `${(index * 17 + 9) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${8 + (index % 6) * 2}s`,
    animationDelay: `${(index % 7) * 1.1}s`,
  }
})
