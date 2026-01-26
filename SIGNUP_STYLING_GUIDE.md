# Signup Page Styling Update Guide

## Changes Applied to Login Page ✅
- Card: `bg-blue-600 border-none shadow-lg`
- CardTitle: `text-white`
- CardDescription: `text-white/90`
- FormLabel: `text-white`
- Input: `bg-white text-blue-600 placeholder:text-blue-400`
- Button: `bg-white text-blue-600 hover:bg-gray-200 border-none`
- Footer text: Outside card with `text-gray-500` for question and `text-blue-600` for link

## Changes Needed for Signup Page

### 1. Card Header ✅ DONE
```tsx
<Card className="min-w-[700px] bg-blue-600 border-none shadow-lg">
    <CardTitle className="text-white">Registrasi</CardTitle>
    <CardDescription className="text-white/90">...</CardDescription>
</Card>
```

### 2. All FormLabel - Need to Add
Find all instances of:
```tsx
<FormLabel>
```

Replace with:
```tsx
<FormLabel className="text-white">
```

### 3. All Input Fields - Need to Update
Find all instances of:
```tsx
className="text-white"
```

Replace with:
```tsx
className="bg-white text-blue-600 placeholder:text-blue-400"
```

### 4. All Select/Dropdown - Need to Update
Find all instances of Select with:
```tsx
<SelectTrigger className="text-white">
```

Replace with:
```tsx
<SelectTrigger className="bg-white text-blue-600">
```

### 5. Textarea - Need to Update
Find:
```tsx
className="text-white"
```
in textarea elements

Replace with:
```tsx
className="bg-white text-blue-600 placeholder:text-blue-400"
```

### 6. Button - Need to Update
Find:
```tsx
<Button type="submit" className="border border-black">Registrasi</Button>
```

Replace with:
```tsx
<Button type="submit" className="bg-white text-blue-600 hover:bg-gray-200 border-none mt-2">Registrasi</Button>
```

### 7. Footer Text - Need to Update
Find:
```tsx
<CardDescription className="text-center">
    Sudah memiliki akun?{" "}
    <Link href={"/auth/login"} className="text-white font-medium">
        {" "}
        Login Sekarang
    </Link>
</CardDescription>
```

Replace with:
```tsx
<p className="text-center mt-4">
    <span className="text-gray-500">Sudah memiliki akun? </span>
    <Link href={"/auth/login"} className="text-blue-600 font-semibold hover:text-blue-700">
        Login Sekarang
    </Link>
</p>
```

### 8. FormMessage - Need to Add
Add to all FormMessage:
```tsx
<FormMessage className="text-white" />
```

---

## Manual Steps Required

Since the signup file is very long (530 lines), please do the following manually:

1. **Open** `src/app/auth/signup/page.tsx`

2. **Find & Replace** (Ctrl+H in VS Code):
   
   **Step 1:** Update all FormLabels
   - Find: `<FormLabel>`
   - Replace: `<FormLabel className="text-white">`
   - Replace All

   **Step 2:** Update all Inputs
   - Find: `className="text-white"`
   - Replace: `className="bg-white text-blue-600 placeholder:text-blue-400"`
   - Replace All (in Input elements)

   **Step 3:** Update all SelectTriggers
   - Find: `<SelectTrigger className="text-white">`
   - Replace: `<SelectTrigger className="bg-white text-blue-600">`
   - Replace All

   **Step 4:** Update Button
   - Find: `className="border border-black">Registrasi`
   - Replace: `className="bg-white text-blue-600 hover:bg-gray-200 border-none mt-2">Registrasi`

   **Step 5:** Update Footer (scroll to bottom ~line 517)
   - Replace the CardDescription footer with the new `<p>` tag structure shown above

   **Step 6:** Add white color to FormMessage
   - Find: `<FormMessage />`
   - Replace: `<FormMessage className="text-white" />`
   - Replace All

3. **Save** the file

4. **Test** the page in browser

---

## Expected Result

After all changes:
- ✅ Blue card background
- ✅ White labels
- ✅ White input fields with blue text
- ✅ White dropdowns with blue text
- ✅ White button with blue text
- ✅ Footer text outside card (gray question + blue link)
- ✅ Consistent with Login page styling
