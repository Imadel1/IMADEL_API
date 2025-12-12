// Utils/emailTemplates.js
/**
 * Generate email template for new content notifications
 * @param {Object} options - Email template options
 * @param {string} options.type - Content type: 'project', 'job', or 'news'
 * @param {Object} options.data - Content data object
 * @param {string} options.data._id - Content ID
 * @param {string} options.data.title - Content title
 * @param {string} options.data.description - Content description
 * @returns {Object} - Email subject and HTML content
 */
export const generateNotificationEmail = ({ type, data }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://imadel.netlify.app';
  
  // Determine content-specific values
  let headerTitle, subjectPrefix, buttonText, detailUrl, imageUrl;
  
  switch (type) {
    case 'project':
      headerTitle = 'Nouveau Projet IMADEL';
      subjectPrefix = 'Nouveau Projet';
      buttonText = 'Voir le Projet';
      detailUrl = `${frontendUrl}/project/${data._id}`;
      imageUrl = data.images && data.images.length > 0 ? data.images[0].url : null;
      break;
    case 'job':
      // Check if it's a job or proposal based on listingType
      const isProposal = data.listingType === 'proposal';
      headerTitle = isProposal 
        ? "Nouvel Appel d'Offres IMADEL" 
        : "Nouvelle Offre d'Emploi IMADEL";
      subjectPrefix = isProposal 
        ? "Nouvel Appel d'Offres" 
        : "Nouvelle Offre d'Emploi";
      buttonText = isProposal 
        ? "Soumettre une Proposition" 
        : 'Postuler Maintenant';
      detailUrl = `${frontendUrl}/job/${data._id}`;
      imageUrl = null; // Jobs/Proposals don't have images
      break;
    case 'news':
      headerTitle = 'Nouvelle Actualité IMADEL';
      subjectPrefix = 'Nouvelle Actualité';
      buttonText = "Lire l'Article";
      detailUrl = `${frontendUrl}/news/${data._id}`;
      imageUrl = data.image || null;
      break;
    default:
      throw new Error(`Unknown content type: ${type}`);
  }
  
  // Generate details section based on content type
  let detailsHtml = '';
  
  if (type === 'project') {
    detailsHtml = `
      ${data.location ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">📍 Lieu:</strong> ${data.location}</p>` : ''}
      ${data.areasOfIntervention && data.areasOfIntervention.length > 0 ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">🎯 Domaines d'intervention:</strong> ${data.areasOfIntervention.join(', ')}</p>` : ''}
      ${data.category ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">📁 Catégorie:</strong> ${data.category}</p>` : ''}
      ${data.status ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">📊 Statut:</strong> ${data.status}</p>` : ''}
    `;
  } else if (type === 'job') {
    const isProposal = data.listingType === 'proposal';
    detailsHtml = `
      <p style="margin: 8px 0;"><strong style="color: #667eea;">📍 Lieu:</strong> ${data.location}</p>
      ${!isProposal && data.type ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">💼 Type:</strong> ${data.type}</p>` : ''}
      <p style="margin: 8px 0;"><strong style="color: #667eea;">📅 Date limite:</strong> ${new Date(data.deadline).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${data.category ? `<p style="margin: 8px 0;"><strong style="color: #667eea;">📁 Catégorie:</strong> ${data.category}</p>` : ''}
      ${!isProposal && data.salary && (data.salary.min || data.salary.max) ? `
        <p style="margin: 8px 0;"><strong style="color: #667eea;">💰 Salaire:</strong> 
          ${data.salary.min && data.salary.max ? `${data.salary.min} - ${data.salary.max}` : data.salary.min ? `À partir de ${data.salary.min}` : `Jusqu'à ${data.salary.max}`} 
          ${data.salary.currency || 'CFA'}
        </p>
      ` : ''}
      ${isProposal && data.budget && (data.budget.min || data.budget.max) ? `
        <p style="margin: 8px 0;"><strong style="color: #667eea;">💰 Budget:</strong> 
          ${data.budget.min && data.budget.max ? `${data.budget.min} - ${data.budget.max}` : data.budget.min ? `À partir de ${data.budget.min}` : `Jusqu'à ${data.budget.max}`} 
          ${data.budget.currency || 'CFA'}
        </p>
      ` : ''}
    `;
  } else if (type === 'news') {
    detailsHtml = `
      <p style="margin: 8px 0;"><strong style="color: #667eea;">✍️ Auteur:</strong> ${data.author}</p>
      <p style="margin: 8px 0;"><strong style="color: #667eea;">📅 Date:</strong> ${new Date(data.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    `;
  }
  
  // Generate HTML email template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${headerTitle}</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        ${imageUrl ? `
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="${imageUrl}" alt="${data.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          </div>
        ` : ''}
        
        <h2 style="color: #667eea; margin-top: 0; font-size: 24px;">${data.title}</h2>
        
        <p style="font-size: 16px; color: #555; margin-bottom: 20px;">${data.description}</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          ${detailsHtml}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${detailUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${buttonText}
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #777; font-size: 14px; margin: 0;">
          Cordialement,<br>
          <strong style="color: #667eea;">L'équipe IMADEL</strong>
        </p>
      </div>
    </body>
    </html>
  `;
  
  return {
    subject: `${subjectPrefix}: ${data.title}`,
    html
  };
};

