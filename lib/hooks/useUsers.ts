import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios.instance";
import { toast } from "sonner";
import { CreateUserInput, UpdateUserInput, UsersListResponse, UserResponse } from "../types/user.types";
import { AxiosError } from "axios";

interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}

export const useUsersQuery = () => {
    return useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axiosInstance.get<UsersListResponse>("/users");
            return response.data.data;
        },
    });
};

export const useCreateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateUserInput) => {
            const response = await axiosInstance.post<UserResponse>("/users", data);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success("User created successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to create user");
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
            const response = await axiosInstance.patch<UserResponse>(`/users/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success("User updated successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to update user");
        },
    });
};

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.delete<UserResponse>(`/users/${id}`);
            return response.data.data;
        },
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            toast.error(error.response?.data?.message || "Failed to delete user");
        },
    });
};
