"use client";

import * as z from 'zod';
import { useState } from 'react';
import { Coupon } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModal } from '@/components/modals/alert-modal';


interface CouponFormProps {
    initialData: Coupon | null;
}

const formSchema = z.object({
    name: z.string().min(1),
    value: z.coerce.number().int().gte(0)
})

type CouponFormValues = z.infer<typeof formSchema>;

export const CouponForm: React.FC<CouponFormProps> = ({
    initialData
}) => {
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const title = initialData ? 'Edit coupon' : 'Create coupon';
    const description = initialData ? 'Edit a coupon' : 'Add a new coupon';
    const toastMessage = initialData ? 'Coupon updated.' : 'Coupon created.';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: 0
        }
    });

    const onSubmit = async (data: CouponFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/coupons/${params.couponId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/coupons`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/coupons`)
            toast.success(toastMessage);
        } catch (error) {
            toast.error('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/coupons/${params.couponId}`);
            router.refresh();
            router.push(`/${params.storeId}/coupons`);
            toast.success('Coupon deleted');
        } catch (error) {
            toast.error('Make sure all products using this coupon are removed first')
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                { initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size='sm'
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8 w-full'
                >
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder='Coupon name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='value'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Percentage</FormLabel>
                                    <FormControl>
                                        <div>
                                            <Input disabled={loading} placeholder='0%' {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className='ml-auto' type='submit'>
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};