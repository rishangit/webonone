import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { 
  fetchStaffMemberRequest,
  updateStaffRequest,
  clearError 
} from "../../../../store/slices/staffSlice";
import { fetchUserRequest } from "../../../../store/slices/usersSlice";
import { Staff } from "../../../../services/staff";
import { daysOfWeek } from "../constants";
import { StaffDetailPageProps } from "../types";

export const useStaffDetailPage = ({ staffId }: StaffDetailPageProps) => {
  const dispatch = useAppDispatch();
  const { currentStaff, loading, error } = useAppSelector((state) => state.staff);
  const { currentUser: userData, users } = useAppSelector((state) => state.users);
  
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Form state
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending">("Active");
  const [bio, setBio] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [workSchedule, setWorkSchedule] = useState<Record<string, { startTime: string; endTime: string; enabled: boolean }>>({
    monday: { startTime: "09:00", endTime: "17:00", enabled: true },
    tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
    friday: { startTime: "09:00", endTime: "17:00", enabled: true },
    saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
    sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  });

  // Fetch staff member on mount
  useEffect(() => {
    dispatch(fetchStaffMemberRequest(staffId));
  }, [dispatch, staffId]);

  // Fetch user data if userId exists
  useEffect(() => {
    if (currentStaff?.userId) {
      const existingUser = users.find(u => String(u.id) === String(currentStaff.userId));
      if (existingUser) {
        setUserInfo(existingUser);
      } else {
        dispatch(fetchUserRequest(currentStaff.userId));
      }
    }
  }, [currentStaff?.userId, dispatch, users]);

  // Update userInfo when currentUser changes
  useEffect(() => {
    if (userData && currentStaff?.userId && String(userData.id) === String(currentStaff.userId)) {
      setUserInfo(userData);
    }
  }, [userData, currentStaff?.userId]);

  // Initialize form when staff data loads
  useEffect(() => {
    if (currentStaff) {
      setStatus(currentStaff.status || "Active");
      setBio(currentStaff.bio || "");
      
      // Handle permissions
      if (Array.isArray(currentStaff.permissions)) {
        setPermissions(currentStaff.permissions);
      } else if (typeof currentStaff.permissions === 'object' && currentStaff.permissions !== null) {
        setPermissions(Object.keys(currentStaff.permissions));
      } else {
        setPermissions([]);
      }
      
      // Handle work schedule
      if (currentStaff.workSchedule) {
        if (currentStaff.workSchedule.schedule) {
          setWorkSchedule(currentStaff.workSchedule.schedule);
        } else {
          // Old format conversion
          const oldStartTime = currentStaff.workSchedule.startTime || "09:00";
          const oldEndTime = currentStaff.workSchedule.endTime || "17:00";
          const oldAvailableDays = currentStaff.workSchedule.availableDays || [];
          const newSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
          daysOfWeek.forEach(day => {
            newSchedule[day.id] = {
              startTime: oldStartTime,
              endTime: oldEndTime,
              enabled: oldAvailableDays.includes(day.id)
            };
          });
          setWorkSchedule(newSchedule);
        }
      }
      
      // Handle emergency contact
      if (currentStaff.emergencyContact) {
        setEmergencyContact({
          name: currentStaff.emergencyContact.name || "",
          phone: currentStaff.emergencyContact.phone || "",
          relationship: currentStaff.emergencyContact.relationship || ""
        });
      }
    }
  }, [currentStaff]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSave = async () => {
    if (!currentStaff) return;

    const permissionsObj = permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    const updateData: any = {
      status,
      bio: bio || null,
      permissions: permissionsObj,
      workSchedule: {
        schedule: workSchedule
      }
    };

    if (emergencyContact.name || emergencyContact.phone || emergencyContact.relationship) {
      updateData.emergencyContact = {
        name: emergencyContact.name || null,
        phone: emergencyContact.phone || null,
        relationship: emergencyContact.relationship || null
      };
    }

    dispatch(updateStaffRequest({
      id: currentStaff.id,
      data: updateData
    }));

    toast.success("Staff member updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!currentStaff) return;
    
    setIsEditing(false);
    setStatus(currentStaff.status || "Active");
    setBio(currentStaff.bio || "");
    
    if (Array.isArray(currentStaff.permissions)) {
      setPermissions(currentStaff.permissions);
    } else if (typeof currentStaff.permissions === 'object' && currentStaff.permissions !== null) {
      setPermissions(Object.keys(currentStaff.permissions));
    }
    
    if (currentStaff.workSchedule) {
      if (currentStaff.workSchedule.schedule) {
        setWorkSchedule(currentStaff.workSchedule.schedule);
      } else {
        const oldStartTime = currentStaff.workSchedule.startTime || "09:00";
        const oldEndTime = currentStaff.workSchedule.endTime || "17:00";
        const oldAvailableDays = currentStaff.workSchedule.availableDays || [];
        const newSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
        daysOfWeek.forEach(day => {
          newSchedule[day.id] = {
            startTime: oldStartTime,
            endTime: oldEndTime,
            enabled: oldAvailableDays.includes(day.id)
          };
        });
        setWorkSchedule(newSchedule);
      }
    }
    
    if (currentStaff.emergencyContact) {
      setEmergencyContact({
        name: currentStaff.emergencyContact.name || "",
        phone: currentStaff.emergencyContact.phone || "",
        relationship: currentStaff.emergencyContact.relationship || ""
      });
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter(p => p !== permission));
    }
  };

  const handleDayToggle = (dayId: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled
      }
    }));
  };

  const handleDayTimeChange = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  return {
    currentStaff,
    loading,
    isEditing,
    setIsEditing,
    userInfo,
    permissions,
    workSchedule,
    handleSave,
    handleCancel,
    handlePermissionChange,
    handleDayToggle,
    handleDayTimeChange,
  };
};
