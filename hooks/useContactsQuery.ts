import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Contact } from '../types/crm';
import { contactsApi } from '../api/crmApi';

export const CONTACTS_QUERY_KEY = ['contacts'] as const;

export function useContactsQuery() {
  return useQuery<Contact[]>({
    queryKey: CONTACTS_QUERY_KEY,
    queryFn: () => contactsApi.getContacts(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: Omit<Contact, 'id'>) => contactsApi.createContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
    }
  });
}

export function useUpdateContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contact: Contact) => contactsApi.updateContact(contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
    }
  });
}
