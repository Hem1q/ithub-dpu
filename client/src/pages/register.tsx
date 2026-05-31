import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { ukraineRegions, specialties, courses, genders, universities } from "@/data/regionsData";
import stuLogo from "@assets/stu_logo_nobg.png";
import { User, Lock, Mail, Phone, MapPin, BookOpen, Users, ChevronRight } from "lucide-react";

const FACULTY_NAME = "Факультет фінансів та цифрових технологій";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const queryClient = useQueryClient();
  const { lang } = useLanguage();

  const l = lang === "uk" ? {
    title: "Реєстрація",
    subtitle: "Освітній ІТ ХАБ — ДПУ",
    step1: "Особисті дані",
    step2: "Навчальна інформація",
    step3: "Акаунт",
    lastName: "Прізвище",
    lastNamePh: "Введіть прізвище",
    firstName: "Ім'я",
    firstNamePh: "Введіть ім'я",
    patronymic: "По батькові",
    patronymicPh: "Введіть по батькові",
    gender: "Стать",
    genderPh: "Оберіть стать",
    birthYear: "Рік народження",
    birthYearPh: "Наприклад: 2003",
    phone: "Номер телефону",
    phonePh: "+380XXXXXXXXX",
    email: "Електронна пошта",
    emailPh: "example@email.com",
    region: "Область/Регіон",
    regionPh: "Оберіть область",
    city: "Місто/Населений пункт",
    cityPh: "Оберіть місто",
    university: "Навчальний заклад",
    universityPh: "Оберіть університет",
    faculty: "Факультет",
    specialty: "Спеціальність",
    specialtyPh: "Оберіть спеціальність",
    course: "Курс",
    coursePh: "Оберіть курс",
    academicGroup: "Академічна група",
    academicGroupPh: "Наприклад: КІ-41",
    username: "Ім'я користувача",
    usernamePh: "Введіть логін",
    password: "Пароль",
    passwordPh: "Мінімум 6 символів",
    confirmPassword: "Підтвердження пароля",
    confirmPasswordPh: "Повторіть пароль",
    submit: "Зареєструватися",
    submitting: "Реєстрація...",
    hasAccount: "Вже маєте акаунт?",
    loginLink: "Увійти",
    errorTitle: "Помилка",
    errorDefault: "Не вдалося зареєструватися",
    errorUnknown: "Сталася невідома помилка",
    successTitle: "Успіх",
    successMsg: "Ви успішно зареєструвалися!",
  } : {
    title: "Registration",
    subtitle: "Educational IT HUB — DPU",
    step1: "Personal Data",
    step2: "Academic Information",
    step3: "Account",
    lastName: "Last Name",
    lastNamePh: "Enter last name",
    firstName: "First Name",
    firstNamePh: "Enter first name",
    patronymic: "Patronymic",
    patronymicPh: "Enter patronymic",
    gender: "Gender",
    genderPh: "Select gender",
    birthYear: "Birth Year",
    birthYearPh: "e.g. 2003",
    phone: "Phone Number",
    phonePh: "+380XXXXXXXXX",
    email: "Email",
    emailPh: "example@email.com",
    region: "Region",
    regionPh: "Select region",
    city: "City",
    cityPh: "Select city",
    university: "University",
    universityPh: "Select university",
    faculty: "Faculty",
    specialty: "Specialty",
    specialtyPh: "Select specialty",
    course: "Course / Year",
    coursePh: "Select course",
    academicGroup: "Academic Group",
    academicGroupPh: "e.g. CS-41",
    username: "Username",
    usernamePh: "Enter username",
    password: "Password",
    passwordPh: "At least 6 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPh: "Repeat your password",
    submit: "Register",
    submitting: "Registering...",
    hasAccount: "Already have an account?",
    loginLink: "Log In",
    errorTitle: "Error",
    errorDefault: "Failed to register",
    errorUnknown: "An unknown error occurred",
    successTitle: "Success",
    successMsg: "You have successfully registered!",
  };

  const registerSchema = z.object({
    lastName: z.string().min(2, lang === "uk" ? "Мінімум 2 символи" : "Min 2 characters"),
    firstName: z.string().min(2, lang === "uk" ? "Мінімум 2 символи" : "Min 2 characters"),
    patronymic: z.string().optional(),
    gender: z.string().min(1, lang === "uk" ? "Оберіть стать" : "Select gender"),
    birthYear: z.string().min(4, lang === "uk" ? "Вкажіть рік народження" : "Enter birth year").regex(/^\d{4}$/, lang === "uk" ? "Формат: РРРР" : "Format: YYYY"),
    phone: z.string().optional(),
    email: z.string().email(lang === "uk" ? "Невірний формат email" : "Invalid email format").optional().or(z.literal("")),
    region: z.string().min(1, lang === "uk" ? "Оберіть область" : "Select region"),
    city: z.string().min(1, lang === "uk" ? "Оберіть місто" : "Select city"),
    university: z.string().min(1, lang === "uk" ? "Оберіть університет" : "Select university"),
    specialty: z.string().min(1, lang === "uk" ? "Оберіть спеціальність" : "Select specialty"),
    course: z.string().min(1, lang === "uk" ? "Оберіть курс" : "Select course"),
    academicGroup: z.string().min(1, lang === "uk" ? "Введіть групу" : "Enter group"),
    username: z.string().min(3, lang === "uk" ? "Мінімум 3 символи" : "Min 3 characters"),
    password: z.string().min(6, lang === "uk" ? "Мінімум 6 символів" : "Min 6 characters"),
    confirmPassword: z.string(),
  }).refine((d) => d.password === d.confirmPassword, {
    message: lang === "uk" ? "Паролі не збігаються" : "Passwords do not match",
    path: ["confirmPassword"],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      lastName: "", firstName: "", patronymic: "", gender: "",
      birthYear: "", phone: "", email: "", region: "", city: "",
      university: "", specialty: "", course: "", academicGroup: "", username: "", password: "", confirmPassword: "",
    },
  });

  const watchedRegion = form.watch("region");
  const availableCities = ukraineRegions.find(r => r.name === watchedRegion)?.cities ?? [];

  useEffect(() => {
    if (watchedRegion !== selectedRegion) {
      setSelectedRegion(watchedRegion);
      form.setValue("city", "");
    }
  }, [watchedRegion]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          patronymic: data.patronymic,
          gender: data.gender,
          birthYear: data.birthYear,
          phone: data.phone,
          email: data.email,
          region: data.region,
          city: data.city,
          university: data.university,
          faculty: FACULTY_NAME,
          specialty: data.specialty,
          course: data.course,
          academicGroup: data.academicGroup,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ title: l.errorTitle, description: error.message || l.errorDefault, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      queryClient.setQueryData(["/api/user"], result.user);
      toast({ title: l.successTitle, description: l.successMsg });
      setTimeout(() => setLocation("/"), 300);
    } catch {
      toast({ title: l.errorTitle, description: l.errorUnknown, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const SectionHeader = ({ icon, title }: { icon: ReactNode; title: string }) => (
    <div className="flex items-center gap-2 pb-2 border-b border-border/60 mb-4">
      <div className="p-1.5 rounded-md bg-primary/10 text-primary">{icon}</div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50/50 dark:bg-background py-8 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={stuLogo} alt="ДПУ" className="w-12 h-12 object-contain" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground leading-tight">
                {lang === "uk" ? "Університет державної фіскальної служби України" : "University of State Fiscal Service of Ukraine"}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">{lang === "uk" ? "Освітній ІТ ХАБ" : "Educational IT HUB"}</p>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{l.title}</CardTitle>
          <p className="text-xs text-muted-foreground">{l.subtitle}</p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* === SECTION 1: Personal Data === */}
              <div>
                <SectionHeader icon={<User className="w-4 h-4" />} title={l.step1} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.lastName} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.lastNamePh} {...field} data-testid="input-lastName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.firstName} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.firstNamePh} {...field} data-testid="input-firstName" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="patronymic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.patronymic}</FormLabel>
                      <FormControl>
                        <Input placeholder={l.patronymicPh} {...field} data-testid="input-patronymic" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.gender} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gender">
                            <SelectValue placeholder={l.genderPh} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genders.map(g => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="birthYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.birthYear} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.birthYearPh} maxLength={4} {...field} data-testid="input-birthYear" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Phone className="w-3 h-3" />{l.phone}</FormLabel>
                      <FormControl>
                        <Input placeholder={l.phonePh} {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Mail className="w-3 h-3" />{l.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={l.emailPh} {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <FormField control={form.control} name="region" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.region} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-region">
                            <SelectValue placeholder={l.regionPh} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {ukraineRegions.map(r => (
                            <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.city} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!watchedRegion}>
                        <FormControl>
                          <SelectTrigger data-testid="select-city">
                            <SelectValue placeholder={watchedRegion ? l.cityPh : (lang === "uk" ? "Спочатку оберіть область" : "Select region first")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {availableCities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* === SECTION 2: Academic Info === */}
              <div>
                <SectionHeader icon={<BookOpen className="w-4 h-4" />} title={l.step2} />

                <div className="space-y-3">
                  <FormField control={form.control} name="university" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.university} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-university">
                            <SelectValue placeholder={l.universityPh} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {universities.map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{l.faculty}</p>
                    <p className="text-sm font-medium text-foreground">{FACULTY_NAME}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <FormField control={form.control} name="specialty" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.specialty} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-specialty">
                            <SelectValue placeholder={l.specialtyPh} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {specialties.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="course" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.course} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-course">
                            <SelectValue placeholder={l.coursePh} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="mt-3">
                  <FormField control={form.control} name="academicGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Users className="w-3 h-3" />{l.academicGroup} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.academicGroupPh} {...field} data-testid="input-academicGroup" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* === SECTION 3: Account === */}
              <div>
                <SectionHeader icon={<Lock className="w-4 h-4" />} title={l.step3} />
                <div className="space-y-3">
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.username} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.usernamePh} {...field} data-testid="input-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.password} *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={l.passwordPh} {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.confirmPassword} *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={l.confirmPasswordPh} {...field} data-testid="input-confirmPassword" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading} data-testid="button-submit" size="lg">
                {isLoading ? l.submitting : l.submit}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </Button>
            </form>
          </Form>

          <p className="text-center text-muted-foreground text-sm mt-4">
            {l.hasAccount}{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
              data-testid="link-login"
            >
              {l.loginLink}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
