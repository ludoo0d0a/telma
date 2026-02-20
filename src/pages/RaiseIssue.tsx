import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { Clock, Ban, Wrench, HeartPulse, DoorClosed, MessageSquareWarning } from 'lucide-react';
import PageLayout from '@/components/shared/PageLayout';

const RaiseIssue: React.FC = () => {
    const issues = [
        { text: 'Delay', icon: <Clock size={48} /> },
        { text: 'Cancellation', icon: <Ban size={48} /> },
        { text: 'Broken Train', icon: <Wrench size={48} /> },
        { text: 'Sick Person', icon: <HeartPulse size={48} /> },
        { text: 'Closed Door', icon: <DoorClosed size={48} /> },
        { text: 'Other', icon: <MessageSquareWarning size={48} /> },
    ];

    const handleIssueClick = (issueText: string) => {
        console.log('Issue reported:', issueText);
        alert(`Thank you for reporting the issue: ${issueText}`);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <PageLayout>
                <Typography variant="h4" align="center" gutterBottom>Raise an Issue</Typography>
                <Grid container spacing={2} justifyContent="center">
                    {issues.map((issue, index) => (
                        <Grid item key={index} xs={6} sm={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleIssueClick(issue.text)}
                                sx={{
                                    height: 150,
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                {issue.icon}
                                <span>{issue.text}</span>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </PageLayout>
        </Box>
    );
};

export default RaiseIssue;
