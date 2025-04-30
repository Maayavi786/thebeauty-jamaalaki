import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDocumentById, 
  queryDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from '@/lib/firestore/dataAccess';
import { WhereFilterOp } from 'firebase/firestore';

// Hook for fetching a single document by ID
export const useFirestoreDocument = <T>(
  collectionName: string,
  docId: string | undefined,
  options = {}
) => {
  return useQuery<T | null>(
    [collectionName, docId],
    () => docId ? getDocumentById<T>(collectionName, docId) : null,
    {
      enabled: !!docId,
      ...options
    }
  );
};

// Hook for querying documents with filters
export const useFirestoreQuery = <T>(
  collectionName: string,
  conditions: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }> = [],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc',
  limitCount?: number,
  options = {}
) => {
  // Create a unique query key based on the conditions and other parameters
  const queryKey = [
    collectionName,
    ...conditions.map(c => `${c.field}_${c.operator}_${JSON.stringify(c.value)}`),
    orderByField,
    orderDirection,
    limitCount
  ];

  return useQuery<T[]>(
    queryKey,
    () => queryDocuments<T>(collectionName, conditions, orderByField, orderDirection, limitCount),
    options
  );
};

// Hook for creating a document
export const useFirestoreCreate = <T>(
  collectionName: string,
  options = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<
    T,
    Error,
    Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  >(
    (data) => createDocument<T>(collectionName, data),
    {
      onSuccess: () => {
        // Invalidate queries for this collection to refetch data
        queryClient.invalidateQueries([collectionName]);
      },
      ...options
    }
  );
};

// Hook for updating a document
export const useFirestoreUpdate = <T>(
  collectionName: string,
  options = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: string; data: Partial<T> }
  >(
    ({ id, data }) => updateDocument<T>(collectionName, id, data),
    {
      onSuccess: (_, variables) => {
        // Invalidate specific document and collection queries
        queryClient.invalidateQueries([collectionName, variables.id]);
        queryClient.invalidateQueries([collectionName]);
      },
      ...options
    }
  );
};

// Hook for deleting a document
export const useFirestoreDelete = (
  collectionName: string,
  options = {}
) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    string
  >(
    (docId) => deleteDocument(collectionName, docId),
    {
      onSuccess: (_, docId) => {
        // Invalidate specific document and collection queries
        queryClient.invalidateQueries([collectionName, docId]);
        queryClient.invalidateQueries([collectionName]);
      },
      ...options
    }
  );
};
