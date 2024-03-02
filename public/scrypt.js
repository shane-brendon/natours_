// browser
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  login(email, password)
})
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    })
    if ((res.data.status = 'success')) console.log('Profile update successful')
  } catch (err) {
    console.log(err.response.data)
    console.log('A problem has occur please retry later')
  }
}
//type is either password or data
const updateData = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://localhost:3000/api/v1/users/resetPassword'
      : 'http://localhost:3000/api/v1/users/updateUser'
  try {
    const res = await axios({
      method: 'POST',
      url: url,
      data: {
        data,
      },
    })
    if ((res.data.status = 'success')) console.log('Profile update successful')
  } catch (err) {
    console.log(err.response.data)
    console.log('A problem has occur please retry later')
  }
}
const logout = async (email, password) => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://localhost:3000/api/v1/users/logout',
    })
    if ((res.data.status = 'success')) location.reload(true)
    console.log(res)
  } catch (err) {
    console.log(err.response.data)
  }
}
