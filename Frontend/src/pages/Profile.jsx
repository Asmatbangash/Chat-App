import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const { user, setUser } = useAuth();
  
  // Initialize preview with user's profile picture
  useEffect(() => {
    if (user?.profilePic) {
      setPreview(user.profilePic);
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FullName: user?.FullName || "",
      bio: user?.bio || "",
      profilePic: null,
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      reset({
        FullName: user.FullName || "",
        bio: user.bio || "",
        profilePic: null,
      });
      if (user.profilePic) {
        setPreview(user.profilePic);
      }
    }
  }, [user, reset]);

  // Handle image change with compression
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    // Compress and convert image to base64
    compressImage(file);
  };

  // Compress image before uploading
  const compressImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large (max 1080px)
        const MAX_SIZE = 1080;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64 (JPEG with 0.7 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setValue('profilePic', compressedBase64);
        setPreview(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    try {
      const updateData = {
        FullName: data.FullName,
        bio: data.bio,
      };

      // Only include profilePic if it was changed
      if (data.profilePic) {
        updateData.profilePic = data.profilePic;
      }

      const response = await api.post("/user/update-profile", updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        maxBodyLength: 10 * 1024 * 1024, // 10MB limit
      });
      
      if (response.data.success) {
        // Update the user context with new data
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsEditing(false);
        
        // Show success message (you can replace with a toast notification)
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-xl border-border/50">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 hover:bg-muted/50 -ml-2"
            >
              <MoveLeft className="h-4 w-4" /> Back to Chat
            </Button>
            
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="gap-2 shadow-sm"
                size="sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center space-y-4 pt-2">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-border/50">
                <AvatarImage src={preview || "https://github.com/shadcn.png"} />
                <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
                  {user?.FullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Label htmlFor="avatar-upload" className="cursor-pointer text-white text-sm font-medium flex flex-col items-center gap-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Change Photo
                  </Label>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-1.5">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {user?.FullName || "User"}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {user?.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator className="bg-border/50" />

        <CardContent className="mt-6">
          {!isEditing ? (
            <div className="space-y-8 py-4">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</p>
                    <p className="font-semibold text-lg text-foreground">{user?.FullName || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email Address</p>
                    <p className="font-semibold text-lg text-foreground break-all">{user?.email || "Not set"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Bio</p>
                    <p className="font-medium text-foreground leading-relaxed">{user?.bio || "No bio added"}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Profile Image
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="text-xs text-muted-foreground">Maximum file size: 5MB. Recommended: Square image, at least 400x400px</p>
                {preview && (
                  <div className="mt-4 flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                      <AvatarImage src={preview} />
                      <AvatarFallback>Preview</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground font-medium">New image preview</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-base font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  {...register("FullName", { required: "Name is required" })}
                  placeholder="Enter your full name"
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
                {errors.FullName && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.FullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Bio
                </Label>
                <Input
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground">Brief description for your profile</p>
              </div>

              <div className="flex gap-3 pt-6 border-t border-border/50">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 gap-2 h-11 shadow-sm hover:shadow-md transition-all"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      FullName: user?.FullName || "",
                      bio: user?.bio || "",
                      profilePic: null,
                    });
                    if (user?.profilePic) {
                      setPreview(user.profilePic);
                    }
                  }}
                  className="flex-1 h-11"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
