import { useState } from 'react'
import './App.css'
import "./component/contactform"
import ContactForm from './component/contactform'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <ContactForm/>
      </div>
    </>
  )
}

export default App
