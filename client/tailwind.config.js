export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT:'#0D5C3A', light:'#22A66A', dark:'#083D27' },
        surface: { DEFAULT:'#111E17', card:'#162219', border:'#1E3028' },
        civic: { red:'#E85038', orange:'#E8901A', yellow:'#FFD060', green:'#4CC88A', blue:'#3B9ED4', purple:'#B57BFF' }
      }
    }
  },
  plugins: []
}
