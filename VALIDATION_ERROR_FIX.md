# Validation Error Fix - Problem & Symptom Forms

## 🐛 Masalah

Saat submit Problem atau Symptom baru, muncul **Validation Error** dari backend meskipun form sudah diisi.

## 🔍 Root Cause

Backend memiliki **validasi ketat** yang tidak dijelaskan di frontend:

### Problem Validation (Backend):
```typescript
// src/admin/dto/problem.dto.ts
export class CreateProblemDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 10)
    @Matches(/^P\d{2,3}$/, {
        message: 'Problem ID must be in format P01, P02, etc.',
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 255)  // ⚠️ MINIMAL 5 KARAKTER!
    name: string;
    
    // ...
}
```

### Symptom Validation (Backend):
```typescript
// src/admin/dto/symptom.dto.ts
export class CreateSymptomDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 10)
    @Matches(/^G\d{2,3}$/, {
        message: 'Symptom ID must be in format G01, G02, etc.',
    })
    id: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 255)  // ⚠️ MINIMAL 5 KARAKTER!
    name: string;
    
    // ...
}
```

## ❌ Contoh Error

Dari screenshot user:
- **Problem ID**: `P111` ✅ (sesuai format)
- **Problem Name**: `ppp` ❌ (hanya 3 karakter, minimal 5!)
- **Description**: `ppp` ✅ (optional)

**Error:** Validation Error karena Name kurang dari 5 karakter!

---

## ✅ Solusi

### 1. Frontend Validation di Problems Form

**File:** `src/app/admin/engine/problems/page.tsx`

**Perubahan:**

#### Problem ID Field:
```tsx
<label className="block text-sm font-medium mb-2">
    Problem ID <span className="text-red-500">*</span>
    <span className="text-xs text-gray-500 ml-2">(Format: P01, P02, P111, etc.)</span>
</label>
<Input
    value={formData.id}
    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
    placeholder="e.g., P01, P02, P111"
    disabled={!!problem}
    required
    pattern="^P\d{2,3}$"
    title="Format: P followed by 2-3 digits (e.g., P01, P111)"
/>
```

#### Problem Name Field:
```tsx
<label className="block text-sm font-medium mb-2">
    Problem Name <span className="text-red-500">*</span>
    <span className="text-xs text-gray-500 ml-2">(min. 5 characters)</span>
</label>
<Input
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g., Mesin Overheat (minimum 5 characters)"
    required
    minLength={5}
    maxLength={255}
/>
{formData.name.length > 0 && formData.name.length < 5 && (
    <p className="text-xs text-red-500 mt-1">
        Name must be at least 5 characters (current: {formData.name.length})
    </p>
)}
```

### 2. Frontend Validation di Symptoms Form

**File:** `src/app/admin/engine/symptoms/page.tsx`

**Perubahan:**

#### Symptom ID Field:
```tsx
<label className="block text-sm font-medium mb-2">
    Symptom ID <span className="text-red-500">*</span>
    <span className="text-xs text-gray-500 ml-2">(Format: G01, G02, G111, etc.)</span>
</label>
<Input
    value={formData.id}
    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
    placeholder="e.g., G01, G02, G111"
    disabled={!!symptom}
    required
    pattern="^G\d{2,3}$"
    title="Format: G followed by 2-3 digits (e.g., G01, G111)"
/>
```

#### Symptom Name Field:
```tsx
<label className="block text-sm font-medium mb-2">
    Symptom Name <span className="text-red-500">*</span>
    <span className="text-xs text-gray-500 ml-2">(min. 5 characters)</span>
</label>
<Input
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g., Suara Mesin Kasar (minimum 5 characters)"
    required
    minLength={5}
    maxLength={255}
/>
{formData.name.length > 0 && formData.name.length < 5 && (
    <p className="text-xs text-red-500 mt-1">
        Name must be at least 5 characters (current: {formData.name.length})
    </p>
)}
```

---

## 📋 Validation Rules Summary

### Problem:
| Field | Rule | Example |
|-------|------|---------|
| ID | Format: `P` + 2-3 digits | `P01`, `P02`, `P111` |
| Name | Min 5, Max 255 characters | `Mesin Overheat` ✅ |
| Description | Optional | Any text |
| Picture | Optional | Filename |

### Symptom:
| Field | Rule | Example |
|-------|------|---------|
| ID | Format: `G` + 2-3 digits | `G01`, `G02`, `G111` |
| Name | Min 5, Max 255 characters | `Suara Mesin Kasar` ✅ |
| Question | Required | Any text |

---

## 🎯 Features Added

1. **Pattern Validation**: HTML5 `pattern` attribute untuk ID format
2. **Length Validation**: `minLength` dan `maxLength` untuk Name
3. **Visual Hints**: 
   - Format hint di label (gray text)
   - Required indicator (red asterisk)
   - Real-time character count warning
4. **User-friendly Messages**:
   - Placeholder dengan contoh yang jelas
   - Error message yang informatif
   - Tooltip pada hover (via `title` attribute)

---

## 🧪 Testing

### Test Case 1: Valid Problem
```
ID: P01
Name: Mesin Overheat
Description: Suhu mesin terlalu tinggi
Picture: overheat.jpg
```
**Result:** ✅ Success

### Test Case 2: Invalid Problem (Name too short)
```
ID: P01
Name: ppp
Description: test
Picture: test.jpg
```
**Result:** ❌ Frontend validation prevents submit
**Message:** "Name must be at least 5 characters (current: 3)"

### Test Case 3: Invalid Problem (ID format wrong)
```
ID: P1
Name: Mesin Overheat
Description: test
Picture: test.jpg
```
**Result:** ❌ Frontend validation prevents submit
**Message:** "Format: P followed by 2-3 digits (e.g., P01, P111)"

---

## 📝 Notes

- Frontend validation sekarang **match** dengan backend validation
- User mendapat feedback **real-time** saat typing
- Error messages lebih **informatif** dan **helpful**
- Tidak perlu submit untuk tahu ada error

---

## ✅ Status

- ✅ Problem Form - Validation Added
- ✅ Symptom Form - Validation Added
- ⏳ Suspension Problem Form - Perlu update yang sama
- ⏳ Suspension Symptom Form - Perlu update yang sama

---

## 🔄 Next Steps

Untuk Suspension module, apply perubahan yang sama:
1. `src/app/admin/suspension/problems/page.tsx`
2. `src/app/admin/suspension/symptoms/page.tsx`

Validation rules sama persis dengan Engine module.
