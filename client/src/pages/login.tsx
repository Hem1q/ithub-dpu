import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";

const labels = {
  uk: {
    title: "Вхід",
    username: "Ім'я користувача",
    usernamePlaceholder: "Введіть ім'я користувача",
    usernameRequired: "Введіть ім'я користувача",
    password: "Пароль",
    passwordPlaceholder: "Введіть пароль",
    passwordRequired: "Введіть пароль",
    submit: "Увійти",
    submitting: "Вхід...",
    noAccount: "Немаєте акаунту?",
    registerLink: "Зареєструватися",
    errorTitle: "Помилка",
    errorDefault: "Невірне ім'я користувача або пароль",
    errorUnknown: "Сталася невідома помилка",
    successTitle: "Успіх",
    successMsg: "Ви успішно увійшли!",
  },
  en: {
    title: "Log In",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    usernameRequired: "Please enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    passwordRequired: "Please enter your password",
    submit: "Log In",
    submitting: "Logging in...",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    errorTitle: "Error",
    errorDefault: "Invalid username or password",
    errorUnknown: "An unknown error occurred",
    successTitle: "Success",
    successMsg: "You have successfully logged in!",
  },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const l = labels[lang];

  const loginSchema = z.object({
    username: z.string().min(1, l.usernameRequired),
    password: z.string().min(1, l.passwordRequired),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: l.errorTitle,
          description: error.message || l.errorDefault,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      const user = result.user;

      queryClient.setQueryData(["/api/user"], user);

      toast({
        title: l.successTitle,
        description: l.successMsg,
      });

      setTimeout(() => {
        setLocation("/");
      }, 300);
    } catch (error) {
      toast({
        title: l.errorTitle,
        description: l.errorUnknown,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">{l.title}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{l.username}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={l.usernamePlaceholder}
                      {...field}
                      data-testid="input-username"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{l.password}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={l.passwordPlaceholder}
                      {...field}
                      data-testid="input-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? l.submitting : l.submit}
            </Button>
          </form>
        </Form>

        <p className="text-center text-muted-foreground text-sm mt-4">
          {l.noAccount}{" "}
          <button
            onClick={() => setLocation("/register")}
            className="text-primary hover:underline font-medium"
            data-testid="link-register"
          >
            {l.registerLink}
          </button>
        </p>
      </Card>
    </div>
  );
}
