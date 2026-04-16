import { College } from '../models/College';

/**
 * Ensures that even if the frontend doesn't send a collegeId (during deployment transition),
 * we default to the "Default College" instead of leaking data from all colleges.
 */
export const getDefaultCollegeId = async (): Promise<string | null> => {
  const defaultCollege = await College.findOne({ code: 'DEFAULT' });
  return defaultCollege ? defaultCollege._id.toString() : null;
};
