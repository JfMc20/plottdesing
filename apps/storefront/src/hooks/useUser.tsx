'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface User {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<User>('/api/profile', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
  })

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  }
}
