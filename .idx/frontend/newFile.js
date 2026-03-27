const headerTitle = document.getElementById("header-title")
const btn = document.getElementByld("button")

btn.onclick = () => {
btn.style.backgroundColor = "black"
btn.style.color = "green"
alert("Hello customer")
headerTitle.innerText ="Hello Hello!"
};
headerTitle.style.display="none"
fetch('https://api.specialgardengroup.org/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return response.json()
  })
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.error('Fetch error:', error)
  });
const fetchData = async () => {
    try {
      const response = await fetch('https://api.specialgardengroup.org/data')
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }
  
  fetchData()