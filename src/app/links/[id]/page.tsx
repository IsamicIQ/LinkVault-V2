import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LinkDetailsClient from '@/components/LinkDetailsClient'

export default async function LinkDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch link with tags
  const { data: linkData, error } = await supabase
    .from('links')
    .select(`
      *,
      link_tags (
        tag:tags (*)
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !linkData) {
    redirect('/dashboard')
  }

  const link = {
    ...linkData,
    tags: (linkData.link_tags || []).map((lt: any) => lt.tag).filter(Boolean),
  }

  return <LinkDetailsClient link={link} />
}

