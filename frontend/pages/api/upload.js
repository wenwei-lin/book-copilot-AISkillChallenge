import { IncomingForm } from 'formidable'

export const config = {
    api: {
        bodyParser: false,
    }
}



export default async function handler(req, res) {
    const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ message: 'File upload failed' });
      return;
    }

    // Assuming you have a specific field name for your file input,
    // replace 'nameOfTheInput' with the actual field name.
    const fieldName = 'nameOfTheInput'; // Replace with your field name

    if (files[fieldName]) {
      const uploadedFile = files[fieldName];

      // Customize the API endpoint where you want to submit the file
      const apiUrl = 'http://zrbridge.top:12503/knowledge_base/upload_doc';

      // Customize other request headers as needed
      const headers = {
        'Content-Type': 'multipart/form-data',
        'accept': 'application/json',
      };

      // Create a new FormData object and append the file and other form fields
      const formData = new FormData();
      formData.append('file', uploadedFile, uploadedFile.name); // Include the file name
      formData.append('knowledge_base_name', fields.knowledge_base_name);

      try {
        // Make a POST request to your custom API with axios
        const apiResponse = await axios.post(apiUrl, formData, {
          headers,
        });

        // Forward the response from the custom API to the frontend
        res.status(apiResponse.status).json(apiResponse.data);
      } catch (error) {
        console.error('Error forwarding to custom API:', error);
        res.status(500).json({ message: 'File upload failed' });
      }
    } else {
      res.status(400).json({ message: 'No file uploaded' });
    }
  });
}
