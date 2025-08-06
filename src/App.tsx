import { Input } from "@/components/ui/input"
import { Button } from "./components/ui/button"

function App() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Input id="Report" type="file" />
        <Button className="w-1/3 space-y-6" type="submit">Submit</Button>
      </div>
    </div>
  )
}

export default App
