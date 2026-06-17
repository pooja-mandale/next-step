import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (receiverId) => `/chats/${receiverId}`,
      providesTags: ['Chat'],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/chats',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useSendMessageMutation,
} = chatApi;
