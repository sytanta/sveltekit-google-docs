export const DOCUMENT_TYPES = [
	'blank',
	'software-proposal',
	'project-proposal',
	'business-letter',
	'resume',
	'cover-letter',
	'letter'
] as const;

export const TEMPLATES: {
	id: (typeof DOCUMENT_TYPES)[number];
	label: string;
	imageUrl: string;
	initialContent: string;
}[] = [
	{ id: 'blank', label: 'Blank Document', imageUrl: '/blank-document.svg', initialContent: '' },
	{
		id: 'software-proposal',
		label: 'Software development proposal',
		imageUrl: '/software-proposal.svg',
		initialContent: `<h1>Software Development Proposal</h1>
<h2>Project overview</h2>
<p>Brief description of the proposed software development project.</p>

<h2>Scope of work</h2>
<p>Detailed breakdown of project deliverables and requirements.</p>

<h2>Timeline</h2>
<p>Project milestone and delivery schedule.</p>

<h2>Budget</h2>
<p>Cost breakdown and payment terms.</p>`
	},
	{
		id: 'project-proposal',
		label: 'Project proposal',
		imageUrl: '/project-proposal.svg',
		initialContent: `<h1>Project  Proposal</h1>
<h2>Executive Summary</h2>
<p>Brief overview of the project proposal.</p>

<h2>Project Goals</h2>
<p>Key objectives and expected outcomes.</p>

<h2>Implementation Plan</h2>
<p>Strategy and methodology for project execution.</p>

<h2>Resources Required</h2>
<p>Team, equipment, and budget requirements.</p>`
	},
	{
		id: 'business-letter',
		label: 'Business letter',
		imageUrl: '/business-letter.svg',
		initialContent: `<h1>Business Letter</h1>
<p>This is a business letter template.</p>`
	},
	{
		id: 'resume',
		label: 'Resume',
		imageUrl: '/resume.svg',
		initialContent: `<h1>[Your Name]</h1>
<p>[Contact Information]</p>

<h2>Professional Summary</h2>
<p>Brief overview of your professional background and key strengths.</p>

<h2>Work Experience</h2>
<p>[Company Name] - [Position]</p>
<p>[Date Range]</p>

<h2>Education</h2>
<p>[Degree] - [Institution]</p>
<p>[Graduation Year]</p>

<h2>Skills</h2>
<p>List of relevant skills and competencies.</p>`
	},
	{
		id: 'cover-letter',
		label: 'Cover letter',
		imageUrl: '/cover-letter.svg',
		initialContent: `<p>[Your Name]</p>
<p>[Your Address]</p>
<p>[City, State ZIP]</p>
<p></p>
<p>[Date]</p>
<p></p>
<p>[Recipient's Name]</p>
<p>[Company Name]</p>
<p>[Company Address]</p>
<p></p>
<p>Dear [Recipient's Name],</p>
<p></p>
<p>I am writing to express my interest in [position] at [company name]</p>
<p></p>
<p>Sincerely,</p>
<p>[Your Name]</p>`
	},
	{
		id: 'letter',
		label: 'Normal letter',
		imageUrl: '/letter.svg',
		initialContent: `<p>Subject: [Email Subject]</p>

<p>Dear [Recipient],</p>
<p></p>
<p>I hope this email finds you well.</p>
<p></p>
<p>[Email Body]</p>
<p></p>
<p>Best regards,</p>
<p>[Your Name]</p>`
	}
];
