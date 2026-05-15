import api from '../api/axios'

export const registerUser = (data) => api.post('/auth/register', data)
export const loginUser   = (data) => api.post('/auth/login', data)
export const getProfile  = ()     => api.get('/auth/profile')
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.put('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  return api.put('/auth/profile', data)
}
