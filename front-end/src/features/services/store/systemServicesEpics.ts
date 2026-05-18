import { Observable, from, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { ofType } from "redux-observable";
import { toast } from "sonner";
import { systemServicesService } from "@/features/services/services/systemServices";
import {
  createSystemServiceFailure,
  createSystemServiceRequest,
  createSystemServiceSuccess,
  deleteSystemServiceFailure,
  deleteSystemServiceRequest,
  deleteSystemServiceSuccess,
  fetchSystemServiceFailure,
  fetchSystemServiceRequest,
  fetchSystemServiceSuccess,
  fetchSystemServicesFailure,
  fetchSystemServicesRequest,
  fetchSystemServicesSuccess,
  updateSystemServiceFailure,
  updateSystemServiceRequest,
  updateSystemServiceSuccess,
} from "./systemServicesSlice";

export const fetchSystemServicesEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemServicesRequest.type),
    switchMap((action) =>
      from(systemServicesService.getSystemServices(action.payload)).pipe(
        map((payload) => fetchSystemServicesSuccess(payload)),
        catchError((error) => of(fetchSystemServicesFailure(error.message)))
      )
    )
  );

export const fetchSystemServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchSystemServiceRequest.type),
    switchMap((action) =>
      from(systemServicesService.getSystemServiceById(action.payload)).pipe(
        map((payload) => fetchSystemServiceSuccess(payload)),
        catchError((error) => of(fetchSystemServiceFailure(error.message)))
      )
    )
  );

export const createSystemServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(createSystemServiceRequest.type),
    switchMap((action) =>
      from(systemServicesService.createSystemService(action.payload)).pipe(
        map((payload) => {
          // Backend forces `isVerified=false` for non-SYSTEM_ADMIN creators.
          // Reflect that in the toast so company owners know the entry is awaiting admin review.
          if (payload?.isVerified === false) {
            toast.success("System service submitted. A system admin will review and verify it.");
          } else {
            toast.success("System service created successfully!");
          }
          return createSystemServiceSuccess(payload);
        }),
        catchError((error) => {
          toast.error(error.message || "Failed to create system service");
          return of(createSystemServiceFailure(error.message));
        })
      )
    )
  );

export const updateSystemServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(updateSystemServiceRequest.type),
    switchMap((action) =>
      from(systemServicesService.updateSystemService(action.payload.id, action.payload.data)).pipe(
        map((payload) => {
          toast.success("System service updated successfully!");
          return updateSystemServiceSuccess(payload);
        }),
        catchError((error) => {
          toast.error(error.message || "Failed to update system service");
          return of(updateSystemServiceFailure(error.message));
        })
      )
    )
  );

export const deleteSystemServiceEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(deleteSystemServiceRequest.type),
    switchMap((action) =>
      from(systemServicesService.deleteSystemService(action.payload)).pipe(
        map(() => {
          toast.success("System service deleted successfully!");
          return deleteSystemServiceSuccess(action.payload);
        }),
        catchError((error) => {
          toast.error(error.message || "Failed to delete system service");
          return of(deleteSystemServiceFailure(error.message));
        })
      )
    )
  );

export const systemServicesEpics = [
  fetchSystemServicesEpic,
  fetchSystemServiceEpic,
  createSystemServiceEpic,
  updateSystemServiceEpic,
  deleteSystemServiceEpic,
];
