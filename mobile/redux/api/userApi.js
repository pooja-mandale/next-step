import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/auth/user/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
    setSecretCode: builder.mutation({
      query: (data) => ({
        url: '/auth/secret-code',
        method: 'PUT',
        body: data,
      }),
    }),
    resetSecretCode: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-secret-code',
        method: 'PUT',
        body: data,
      }),
    }),
    verifySecretCode: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-secret-code',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSetSecretCodeMutation,
  useVerifySecretCodeMutation,
  useResetSecretCodeMutation,
} = userApi;
