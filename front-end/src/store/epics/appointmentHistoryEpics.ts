import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { toast } from 'sonner';
import { appointmentHistoryService } from '../../services/appointmentHistory';
import { companySalesService } from '../../services/companySales';
import {
  fetchAppointmentHistoryRequest,
  fetchAppointmentHistorySuccess,
  fetchAppointmentHistoryFailure,
  fetchUserAppointmentHistoryRequest,
  fetchUserAppointmentHistorySuccess,
  fetchUserAppointmentHistoryFailure,
} from '../slices/appointmentHistorySlice';

// Epic to fetch appointment history with filters
// If companyId is provided, use company-sales endpoint, otherwise use appointment-history
export const fetchAppointmentHistoryEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchAppointmentHistoryRequest.type),
    switchMap((action) => {
      // If companyId is provided, use company-sales endpoint
      const service = action.payload.companyId 
        ? companySalesService.getCompanySales(action.payload)
        : appointmentHistoryService.getAppointmentHistory(action.payload);
      
      return from(service).pipe(
        map((result) => {
          // Handle both paginated and non-paginated responses
          if (Array.isArray(result)) {
            return fetchAppointmentHistorySuccess(result);
          } else {
            // For company sales, map sales to history format
            const history = result.sales.map((sale: any) => ({
              id: sale.id,
              appointmentId: sale.appointmentId,
              userId: sale.userId,
              companyId: sale.companyId,
              serviceId: sale.serviceId,
              staffId: sale.staffId,
              spaceId: sale.spaceId,
              servicesUsed: sale.servicesUsed,
              productsUsed: sale.productsUsed,
              totalAmount: sale.totalAmount,
              subtotal: sale.subtotal,
              discountAmount: sale.discountAmount,
              createdAt: sale.createdAt,
              updatedAt: sale.updatedAt,
              userName: sale.userName,
              userEmail: sale.userEmail,
              userPhone: sale.userPhone,
              userAvatar: sale.userAvatar,
              userFirstName: sale.userFirstName,
              userLastName: sale.userLastName,
              companyName: sale.companyName
            }));
            return fetchAppointmentHistorySuccess({ history, pagination: result.pagination });
          }
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to fetch sales');
          return of(fetchAppointmentHistoryFailure(error.message));
        })
      );
    })
  );

// Epic to fetch appointment history for a specific user
export const fetchUserAppointmentHistoryEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(fetchUserAppointmentHistoryRequest.type),
    switchMap((action) =>
      from(appointmentHistoryService.getAppointmentHistoryByUserId(action.payload.userId, { companyId: action.payload.companyId })).pipe(
        map((history) => {
          return fetchUserAppointmentHistorySuccess(history);
        }),
        catchError((error) => {
          toast.error(error.message || 'Failed to fetch user appointment history');
          return of(fetchUserAppointmentHistoryFailure(error.message));
        })
      )
    )
  );

