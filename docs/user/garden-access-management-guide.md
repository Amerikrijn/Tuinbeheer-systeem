# 🌱 Garden Access Management Guide

## Overview
This guide explains how to manage user access to gardens in the Tuinbeheer system. Administrators can grant or revoke access to specific gardens for users.

## Admin Interface

### Accessing Garden Access Management
1. Log in as an administrator
2. Navigate to **Admin** → **Users**
3. Select a user from the list
4. Click on **Garden Access** tab

### Granting Garden Access
1. In the Garden Access section, you'll see a list of all available gardens
2. Check the boxes next to gardens you want to grant access to
3. Click **Save Changes**
4. The user will now have access to the selected gardens

### Revoking Garden Access
1. Uncheck the boxes next to gardens you want to revoke access from
2. Click **Save Changes**
3. The user will no longer have access to those gardens

## User Experience

### What Users See
- Users can only see gardens they have been granted access to
- The garden list in the main navigation will only show accessible gardens
- Users cannot access garden details or plant beds for gardens they don't have access to

### Access Levels
- **Read Access**: Users can view garden information and plant data
- **Write Access**: Users can modify garden content (future feature)
- **Admin Access**: Users can manage garden settings (future feature)

## Technical Details

### Database Structure
The system uses a `user_garden_access` table to track permissions:
- `user_id`: Reference to the user
- `garden_id`: Reference to the garden
- `access_level`: Type of access (read/write/admin)
- `granted_by`: Who granted the access
- `created_at`: When access was granted

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **Audit Logging**: All access changes are logged
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Secure error messages with no information leakage

## Troubleshooting

### Common Issues

#### "Access preferences not saving"
- **Cause**: Database connection issue or validation error
- **Solution**: Check network connection and try again
- **Prevention**: System automatically retries failed operations

#### "User cannot see gardens"
- **Cause**: No garden access has been granted
- **Solution**: Grant access to at least one garden
- **Check**: Verify user has been granted access in admin interface

#### "Permission denied errors"
- **Cause**: User trying to access unauthorized garden
- **Solution**: Grant appropriate access in admin interface
- **Security**: This is expected behavior for unauthorized access

### Error Messages
- **"Unauthorized"**: User not logged in or session expired
- **"Access denied"**: User doesn't have permission for this garden
- **"Garden not found"**: Garden doesn't exist or user has no access
- **"Database error"**: Temporary system issue, try again

## Best Practices

### For Administrators
1. **Principle of Least Privilege**: Only grant access to gardens users need
2. **Regular Audits**: Periodically review user access permissions
3. **Documentation**: Keep track of why access was granted
4. **Testing**: Verify access works after granting permissions

### For Users
1. **Contact Admin**: Request access through proper channels
2. **Report Issues**: Contact support if access isn't working
3. **Security**: Don't share login credentials
4. **Updates**: Log out and back in if access changes don't appear

## Support

### Getting Help
- **Technical Issues**: Contact system administrator
- **Access Requests**: Contact your garden manager
- **Bug Reports**: Use the feedback system in the application

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Stable internet connection
- Valid user account with appropriate permissions

## Future Enhancements

### Planned Features
- **Bulk Access Management**: Grant access to multiple users at once
- **Access Templates**: Predefined access patterns for common roles
- **Time-based Access**: Temporary access with expiration dates
- **Advanced Permissions**: Granular control over specific garden features
- **Access History**: Detailed audit trail of all access changes

### Integration Plans
- **Single Sign-On (SSO)**: Integration with organization authentication
- **Role-based Access**: Automatic access based on user roles
- **API Access**: Programmatic access management
- **Mobile App**: Garden access management on mobile devices
