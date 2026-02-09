from flask import Flask, render_template, request, jsonify, session
import os
import pandas as pd
import numpy as np
import string
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
import json
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
app.secret_key = 'spam-detector-secret-key-2025'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Download NLTK stopwords
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')


def fig_to_base64(fig):
    """Convert matplotlib figure to base64 string"""
    buf = BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return img_str


def remove_punctuations(text):
    """Remove punctuations from text"""
    punctuations_list = string.punctuation
    temp = str.maketrans('', '', punctuations_list)
    return text.translate(temp)


def remove_stopwords(text):
    """Remove stopwords from text"""
    stop_words = stopwords.words('english')
    imp_words = []
    for word in str(text).split():
        word = word.lower()
        if word not in stop_words:
            imp_words.append(word)
    return " ".join(imp_words)


def create_wordcloud(data, label_type):
    """Create word cloud visualization"""
    email_corpus = " ".join(data['text'])
    wc = WordCloud(background_color='black', max_words=100, width=800, height=400, colormap='viridis').generate(email_corpus)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.imshow(wc, interpolation='bilinear')
    ax.set_title(f'WordCloud for {label_type} Emails', fontsize=16, color='white', pad=20)
    ax.axis('off')
    fig.patch.set_facecolor('#1a1a2e')
    
    return fig_to_base64(fig)


def create_confusion_matrix_plot(y_true, y_pred):
    """Create confusion matrix visualization"""
    cm = confusion_matrix(y_true, y_pred)
    
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Ham', 'Spam'], 
                yticklabels=['Ham', 'Spam'],
                ax=ax)
    ax.set_title('Confusion Matrix', fontsize=14, color='white', pad=15)
    ax.set_xlabel('Predicted Label', fontsize=12, color='white')
    ax.set_ylabel('True Label', fontsize=12, color='white')
    ax.tick_params(colors='white')
    fig.patch.set_facecolor('#1a1a2e')
    ax.set_facecolor('#16213e')
    
    return fig_to_base64(fig)


@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')


@app.route('/upload')
def upload():
    """Upload page"""
    return render_template('upload.html')


@app.route('/process', methods=['POST'])
def process():
    """Process uploaded dataset and train model"""
    try:
        if 'dataset' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['dataset']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Load dataset
        data = pd.read_csv(filepath)
        
        # Check if required columns exist
        if 'label' not in data.columns or 'text' not in data.columns:
            return jsonify({'error': 'Dataset must contain "label" and "text" columns'}), 400
        
        results = {}
        
        # Step 1: Dataset info
        results['dataset_shape'] = data.shape
        results['total_samples'] = len(data)
        
        # Step 2: Class distribution (before balancing)
        label_counts = data['label'].value_counts().to_dict()
        results['original_distribution'] = label_counts
        
        # Create distribution plot
        fig, ax = plt.subplots(figsize=(8, 5))
        sns.countplot(x='label', data=data, palette=['#00d4ff', '#ff006e'], ax=ax)
        ax.set_title('Original Distribution of Spam and Ham Emails', fontsize=14, color='white', pad=15)
        ax.set_xlabel('Label', fontsize=12, color='white')
        ax.set_ylabel('Count', fontsize=12, color='white')
        ax.tick_params(colors='white')
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#16213e')
        results['original_distribution_plot'] = fig_to_base64(fig)
        
        # Step 3: Balance dataset
        ham_msg = data[data['label'] == 'ham']
        spam_msg = data[data['label'] == 'spam']
        
        # Balance the dataset by taking min samples
        min_samples = min(len(ham_msg), len(spam_msg))
        ham_msg_balanced = ham_msg.sample(n=min_samples, random_state=42)
        spam_msg_balanced = spam_msg.sample(n=min_samples, random_state=42)
        balanced_data = pd.concat([ham_msg_balanced, spam_msg_balanced]).reset_index(drop=True)
        
        results['balanced_samples'] = len(balanced_data)
        results['ham_samples'] = len(ham_msg_balanced)
        results['spam_samples'] = len(spam_msg_balanced)
        
        # Create balanced distribution plot
        fig, ax = plt.subplots(figsize=(8, 5))
        sns.countplot(x='label', data=balanced_data, palette=['#00d4ff', '#ff006e'], ax=ax)
        ax.set_title('Balanced Distribution of Spam and Ham Emails', fontsize=14, color='white', pad=15)
        ax.set_xlabel('Label', fontsize=12, color='white')
        ax.set_ylabel('Count', fontsize=12, color='white')
        ax.tick_params(colors='white')
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#16213e')
        results['balanced_distribution_plot'] = fig_to_base64(fig)
        
        # Step 4: Text preprocessing
        balanced_data['text'] = balanced_data['text'].str.replace('Subject', '', regex=False)
        balanced_data['text'] = balanced_data['text'].apply(lambda x: remove_punctuations(x))
        balanced_data['text'] = balanced_data['text'].apply(lambda text: remove_stopwords(text))
        
        # Step 5: Create word clouds
        results['ham_wordcloud'] = create_wordcloud(
            balanced_data[balanced_data['label'] == 'ham'], 'Non-Spam'
        )
        results['spam_wordcloud'] = create_wordcloud(
            balanced_data[balanced_data['label'] == 'spam'], 'Spam'
        )
        
        # Step 6: Train-test split
        X = balanced_data['text']
        y = balanced_data['label'].map({'ham': 0, 'spam': 1})  # Convert to numerical
        
        train_X, test_X, train_Y, test_Y = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        results['train_samples'] = len(train_X)
        results['test_samples'] = len(test_X)
        
        # Step 7: TF-IDF Vectorization
        vectorizer = TfidfVectorizer(
            max_features=5000,  # Limit features for better performance
            stop_words='english',
            ngram_range=(1, 2),  # Use both unigrams and bigrams
            min_df=2,  # Ignore terms that appear in less than 2 documents
            max_df=0.95  # Ignore terms that appear in more than 95% of documents
        )
        
        # Fit and transform training data
        train_X_tfidf = vectorizer.fit_transform(train_X)
        test_X_tfidf = vectorizer.transform(test_X)
        
        results['vocabulary_size'] = len(vectorizer.vocabulary_)
        results['feature_names_sample'] = list(vectorizer.get_feature_names_out())[:20]
        
        # Step 8: Train Naive Bayes classifier
        classifier = MultinomialNB(alpha=0.1)  # Laplace smoothing
        
        # Train model
        classifier.fit(train_X_tfidf, train_Y)
        
        # Step 9: Evaluate model
        train_predictions = classifier.predict(train_X_tfidf)
        test_predictions = classifier.predict(test_X_tfidf)
        
        train_accuracy = accuracy_score(train_Y, train_predictions)
        test_accuracy = accuracy_score(test_Y, test_predictions)
        
        results['train_accuracy'] = float(train_accuracy)
        results['test_accuracy'] = float(test_accuracy)
        
        # Get classification report
        report = classification_report(test_Y, test_predictions, 
                                      target_names=['Ham', 'Spam'], 
                                      output_dict=True)
        results['classification_report'] = report
        
        # Create confusion matrix
        results['confusion_matrix_plot'] = create_confusion_matrix_plot(test_Y, test_predictions)
        
        # Get feature importance (top words for spam/ham)
        feature_names = vectorizer.get_feature_names_out()
        log_prob = classifier.feature_log_prob_
        
        # Top words for spam (class 1)
        top_spam_indices = log_prob[1].argsort()[-20:][::-1]
        top_spam_words = [feature_names[i] for i in top_spam_indices]
        
        # Top words for ham (class 0)
        top_ham_indices = log_prob[0].argsort()[-20:][::-1]
        top_ham_words = [feature_names[i] for i in top_ham_indices]
        
        results['top_spam_words'] = top_spam_words
        results['top_ham_words'] = top_ham_words
        
        # Create feature importance plot
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Spam words
        spam_probs = np.exp(log_prob[1][top_spam_indices])
        ax1.barh(range(len(top_spam_words)), spam_probs, color='#ff006e')
        ax1.set_yticks(range(len(top_spam_words)))
        ax1.set_yticklabels(top_spam_words, fontsize=9)
        ax1.set_title('Top Words for Spam Detection', fontsize=12, color='white', pad=15)
        ax1.set_xlabel('Probability', fontsize=10, color='white')
        ax1.invert_yaxis()
        ax1.tick_params(colors='white')
        
        # Ham words
        ham_probs = np.exp(log_prob[0][top_ham_indices])
        ax2.barh(range(len(top_ham_words)), ham_probs, color='#00d4ff')
        ax2.set_yticks(range(len(top_ham_words)))
        ax2.set_yticklabels(top_ham_words, fontsize=9)
        ax2.set_title('Top Words for Ham Detection', fontsize=12, color='white', pad=15)
        ax2.set_xlabel('Probability', fontsize=10, color='white')
        ax2.invert_yaxis()
        ax2.tick_params(colors='white')
        
        fig.patch.set_facecolor('#1a1a2e')
        ax1.set_facecolor('#16213e')
        ax2.set_facecolor('#16213e')
        plt.tight_layout()
        
        results['feature_importance_plot'] = fig_to_base64(fig)
        
        # Step 10: Save model and vectorizer
        model_path = os.path.join(app.config['UPLOAD_FOLDER'], 'spam_model.joblib')
        vectorizer_path = os.path.join(app.config['UPLOAD_FOLDER'], 'tfidf_vectorizer.joblib')
        
        joblib.dump(classifier, model_path)
        joblib.dump(vectorizer, vectorizer_path)
        
        # Save sample predictions for demonstration
        sample_texts = test_X.sample(min(5, len(test_X)), random_state=42).tolist()
        sample_predictions = classifier.predict(vectorizer.transform(sample_texts))
        sample_probs = classifier.predict_proba(vectorizer.transform(sample_texts))
        
        results['sample_predictions'] = []
        for text, pred, prob in zip(sample_texts, sample_predictions, sample_probs):
            results['sample_predictions'].append({
                'text': text[:100] + '...' if len(text) > 100 else text,
                'prediction': 'Spam' if pred == 1 else 'Ham',
                'spam_probability': float(prob[1]),
                'ham_probability': float(prob[0])
            })
        
        return jsonify(results)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    """Predict if a single email is spam or ham"""
    try:
        data = request.json
        if 'email_text' not in data:
            return jsonify({'error': 'No email text provided'}), 400
        
        email_text = data['email_text']
        
        # Load model and vectorizer
        model_path = os.path.join(app.config['UPLOAD_FOLDER'], 'spam_model.joblib')
        vectorizer_path = os.path.join(app.config['UPLOAD_FOLDER'], 'tfidf_vectorizer.joblib')
        
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
            return jsonify({'error': 'Model not trained yet. Please train a model first.'}), 400
        
        classifier = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        
        # Preprocess text
        processed_text = remove_punctuations(email_text)
        processed_text = remove_stopwords(processed_text)
        
        # Transform and predict
        text_tfidf = vectorizer.transform([processed_text])
        prediction = classifier.predict(text_tfidf)[0]
        probabilities = classifier.predict_proba(text_tfidf)[0]
        
        return jsonify({
            'prediction': 'Spam' if prediction == 1 else 'Ham',
            'spam_probability': float(probabilities[1]),
            'ham_probability': float(probabilities[0]),
            'processed_text': processed_text[:200] + '...' if len(processed_text) > 200 else processed_text
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/results')
def results():
    """Results page"""
    return render_template('results.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)